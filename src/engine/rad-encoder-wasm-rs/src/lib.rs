use js_sys::{Array, Object, Reflect, Uint32Array, Uint8Array};
use serde_json::{json, Value};
use wasm_bindgen::{prelude::*, JsCast};

const RAD_MAGIC: [u8; 4] = *b"RAD0";
const RAD_CHUNK_MAGIC: [u8; 4] = *b"RADC";
const CHUNK_SIZE: usize = 65_536;
const LN_SCALE_MIN: f64 = -12.0;
const LN_SCALE_MAX: f64 = 9.0;

#[wasm_bindgen]
pub fn encode_packed_rad_bundle(
    packed_array: Uint32Array,
    num_splats: usize,
    lod_tree: Uint32Array,
    extra_arrays: JsValue,
    splat_encoding: JsValue,
    root_name: String,
    chunk_prefix: String,
    bounds: JsValue,
) -> Result<JsValue, JsValue> {
    if num_splats == 0 {
        return Err(JsValue::from_str("RAD bundle encode requires at least one splat."));
    }
    let packed_len = packed_array.length() as usize;
    if packed_len < num_splats.saturating_mul(4) {
        return Err(JsValue::from_str("packedArray is shorter than numSplats * 4."));
    }

    let mut packed = vec![0u32; packed_len];
    packed_array.copy_to(&mut packed);

    let lod_tree_len = lod_tree.length() as usize;
    let has_lod_tree = lod_tree_len >= num_splats.saturating_mul(4);
    let lod_tree_data = if has_lod_tree {
        let mut data = vec![0u32; lod_tree_len];
        lod_tree.copy_to(&mut data);
        Some(data)
    } else {
        None
    };

    let encoding = SplatEncoding::from_js(&splat_encoding, has_lod_tree);
    let extra = ExtraArrays::from_js(&extra_arrays, num_splats)?;
    let chunk_count = (num_splats + CHUNK_SIZE - 1) / CHUNK_SIZE;
    let mut chunks: Vec<(String, Vec<u8>)> = Vec::with_capacity(chunk_count);
    let mut chunk_ranges = Vec::with_capacity(chunk_count);
    let mut all_chunk_bytes = 0u64;

    for chunk_index in 0..chunk_count {
        let base = chunk_index * CHUNK_SIZE;
        let count = (num_splats - base).min(CHUNK_SIZE);
        let chunk = encode_chunk(
            &packed,
            lod_tree_data.as_deref(),
            &extra,
            base,
            count,
            &encoding,
        )?;
        let filename = format!("{chunk_prefix}{chunk_index}.radc");
        chunk_ranges.push(json!({
            "offset": 0,
            "bytes": chunk.len() as u64,
            "filename": filename,
        }));
        all_chunk_bytes += chunk.len() as u64;
        chunks.push((filename, chunk));
    }

    let mut meta = json!({
        "version": 1,
        "type": "gsplat",
        "count": num_splats as u64,
        "maxSh": extra.max_sh,
        "chunkSize": CHUNK_SIZE,
        "allChunkBytes": all_chunk_bytes,
        "chunks": chunk_ranges,
        "splatEncoding": encoding.to_json(),
        "comment": serde_json::to_string_pretty(&json!({
            "encoder": "camera-frames-rad-wasm",
            "method": if has_lod_tree { "prebaked lodSplats" } else { "packed splats" },
            "rootName": root_name,
        })).unwrap_or_default(),
    });
    if has_lod_tree {
        meta["lodTree"] = Value::Bool(true);
    }

    let mut root_bytes = Vec::new();
    write_rad_root(&mut root_bytes, &meta)?;

    let result = Object::new();
    Reflect::set(&result, &JsValue::from_str("root"), &entry_object(&root_name, root_bytes))?;

    let chunk_array = Array::new();
    for (name, bytes) in chunks {
        chunk_array.push(&entry_object(&name, bytes));
    }
    Reflect::set(&result, &JsValue::from_str("chunks"), &chunk_array)?;

    let metadata = Object::new();
    Reflect::set(
        &metadata,
        &JsValue::from_str("sparkVersion"),
        &JsValue::from_str("2.0.0"),
    )?;
    Reflect::set(&metadata, &JsValue::from_str("bounds"), &bounds)?;
    Reflect::set(
        &metadata,
        &JsValue::from_str("rootName"),
        &JsValue::from_str(&root_name),
    )?;
    let build = Object::new();
    Reflect::set(&build, &JsValue::from_str("mode"), &JsValue::from_str("quality"))?;
    Reflect::set(&build, &JsValue::from_str("chunked"), &JsValue::TRUE)?;
    Reflect::set(
        &build,
        &JsValue::from_str("encoder"),
        &JsValue::from_str("camera-frames-rad-wasm"),
    )?;
    Reflect::set(
        &build,
        &JsValue::from_str("usedPrebakedLod"),
        &JsValue::from_bool(has_lod_tree),
    )?;
    Reflect::set(&metadata, &JsValue::from_str("build"), &build)?;
    Reflect::set(&result, &JsValue::from_str("metadata"), &metadata)?;

    Ok(result.into())
}

struct ExtraArrays {
    sh1: Option<Vec<u32>>,
    sh2: Option<Vec<u32>>,
    sh3: Option<Vec<u32>>,
    max_sh: u8,
}

impl ExtraArrays {
    fn from_js(value: &JsValue, num_splats: usize) -> Result<Self, JsValue> {
        let sh1 = optional_uint32_array(value, "sh1")?;
        let sh2 = optional_uint32_array(value, "sh2")?;
        let sh3 = optional_uint32_array(value, "sh3")?;
        validate_sh_len("sh1", sh1.as_deref(), num_splats, 2)?;
        validate_sh_len("sh2", sh2.as_deref(), num_splats, 4)?;
        validate_sh_len("sh3", sh3.as_deref(), num_splats, 4)?;
        let max_sh = if sh3.is_some() {
            3
        } else if sh2.is_some() {
            2
        } else if sh1.is_some() {
            1
        } else {
            0
        };
        Ok(Self {
            sh1,
            sh2,
            sh3,
            max_sh,
        })
    }
}

fn optional_uint32_array(value: &JsValue, key: &str) -> Result<Option<Vec<u32>>, JsValue> {
    let next = Reflect::get(value, &JsValue::from_str(key))?;
    if next.is_undefined() || next.is_null() {
        return Ok(None);
    }
    let typed = next
        .dyn_into::<Uint32Array>()
        .map_err(|_| JsValue::from_str(&format!("{key} must be a Uint32Array.")))?;
    let mut data = vec![0u32; typed.length() as usize];
    typed.copy_to(&mut data);
    Ok(Some(data))
}

fn validate_sh_len(
    key: &str,
    value: Option<&[u32]>,
    num_splats: usize,
    words_per_splat: usize,
) -> Result<(), JsValue> {
    let Some(data) = value else {
        return Ok(());
    };
    let required = num_splats.saturating_mul(words_per_splat);
    if data.len() < required {
        return Err(JsValue::from_str(&format!(
            "{key} is shorter than numSplats * {words_per_splat}."
        )));
    }
    Ok(())
}

#[derive(Clone)]
struct SplatEncoding {
    rgb_min: f64,
    rgb_max: f64,
    ln_scale_min: f64,
    ln_scale_max: f64,
    sh1_max: f64,
    sh2_max: f64,
    sh3_max: f64,
    lod_opacity: bool,
}

impl SplatEncoding {
    fn from_js(value: &JsValue, has_lod_tree: bool) -> Self {
        Self {
            rgb_min: js_number(value, "rgbMin", 0.0),
            rgb_max: js_number(value, "rgbMax", 1.0),
            ln_scale_min: js_number(value, "lnScaleMin", LN_SCALE_MIN),
            ln_scale_max: js_number(value, "lnScaleMax", LN_SCALE_MAX),
            sh1_max: js_number(value, "sh1Max", 1.0),
            sh2_max: js_number(value, "sh2Max", 1.0),
            sh3_max: js_number(value, "sh3Max", 1.0),
            lod_opacity: has_lod_tree,
        }
    }

    fn to_json(&self) -> Value {
        json!({
            "rgbMin": self.rgb_min,
            "rgbMax": self.rgb_max,
            "lnScaleMin": self.ln_scale_min,
            "lnScaleMax": self.ln_scale_max,
            "sh1Max": self.sh1_max,
            "sh2Max": self.sh2_max,
            "sh3Max": self.sh3_max,
            "lodOpacity": self.lod_opacity,
        })
    }
}

fn js_number(value: &JsValue, key: &str, fallback: f64) -> f64 {
    Reflect::get(value, &JsValue::from_str(key))
        .ok()
        .and_then(|next| next.as_f64())
        .filter(|next| next.is_finite())
        .unwrap_or(fallback)
}

fn encode_chunk(
    packed: &[u32],
    lod_tree: Option<&[u32]>,
    extra: &ExtraArrays,
    base: usize,
    count: usize,
    encoding: &SplatEncoding,
) -> Result<Vec<u8>, JsValue> {
    let has_lod_tree = lod_tree.is_some();
    let mut properties: Vec<(Value, Vec<u8>)> = vec![
        (
            json!({ "property": "center", "encoding": "f16_lebytes" }),
            encode_center_f16_lebytes(packed, base, count),
        ),
        (
            json!({
                "property": "alpha",
                "encoding": "r8",
                "min": 0.0,
                "max": if has_lod_tree { 2.0 } else { 1.0 },
            }),
            encode_alpha_r8(packed, base, count),
        ),
        (
            json!({
                "property": "rgb",
                "encoding": "r8",
                "min": encoding.rgb_min,
                "max": encoding.rgb_max,
            }),
            encode_rgb_r8(packed, base, count),
        ),
        (
            json!({
                "property": "scales",
                "encoding": "ln_0r8",
                "min": encoding.ln_scale_min,
                "max": encoding.ln_scale_max,
            }),
            encode_scales_ln_0r8(packed, base, count),
        ),
        (
            json!({ "property": "orientation", "encoding": "oct88r8" }),
            encode_orientation_oct88r8(packed, base, count),
        ),
    ];

    if extra.max_sh >= 1 {
        if let Some(sh1) = extra.sh1.as_deref() {
            let max = safe_sh_max(encoding.sh1_max);
            properties.push((
                json!({
                    "property": "sh1",
                    "encoding": "s8",
                    "min": -max,
                    "max": max,
                }),
                encode_sh1_s8(sh1, base, count, max),
            ));
        }
    }
    if extra.max_sh >= 2 {
        if let Some(sh2) = extra.sh2.as_deref() {
            let max = safe_sh_max(encoding.sh2_max);
            properties.push((
                json!({
                    "property": "sh2",
                    "encoding": "s8",
                    "min": -max,
                    "max": max,
                }),
                encode_sh2_s8(sh2, base, count, max),
            ));
        }
    }
    if extra.max_sh >= 3 {
        if let Some(sh3) = extra.sh3.as_deref() {
            let max = safe_sh_max(encoding.sh3_max);
            properties.push((
                json!({
                    "property": "sh3",
                    "encoding": "s8",
                    "min": -max,
                    "max": max,
                }),
                encode_sh3_s8(sh3, base, count, max),
            ));
        }
    }

    if let Some(lod) = lod_tree {
        properties.push((
            json!({ "property": "child_count", "encoding": "u16" }),
            encode_child_count_u16(lod, base, count),
        ));
        properties.push((
            json!({ "property": "child_start", "encoding": "u32" }),
            encode_child_start_u32(lod, base, count),
        ));
    }

    let mut payload_bytes = 0u64;
    let properties_meta: Vec<Value> = properties
        .iter()
        .map(|(property, bytes)| {
            let mut next = property.clone();
            next["offset"] = Value::from(payload_bytes);
            next["bytes"] = Value::from(bytes.len() as u64);
            payload_bytes += roundup8(bytes.len()) as u64;
            next
        })
        .collect();

    let mut meta = json!({
        "version": 1,
        "base": base as u64,
        "count": count as u64,
        "payloadBytes": payload_bytes,
        "maxSh": extra.max_sh,
        "splatEncoding": encoding.to_json(),
        "properties": properties_meta,
    });
    if has_lod_tree {
        meta["lodTree"] = Value::Bool(true);
    }

    let meta_bytes = serde_json::to_vec(&meta).map_err(|error| JsValue::from_str(&error.to_string()))?;
    let mut encoded = Vec::with_capacity(8 + roundup8(meta_bytes.len()) + 8 + payload_bytes as usize);
    encoded.extend_from_slice(&RAD_CHUNK_MAGIC);
    encoded.extend_from_slice(&(meta_bytes.len() as u32).to_le_bytes());
    encoded.extend_from_slice(&meta_bytes);
    write_zero_pad(&mut encoded, meta_bytes.len());
    encoded.extend_from_slice(&payload_bytes.to_le_bytes());
    for (_property, bytes) in properties {
        encoded.extend_from_slice(&bytes);
        write_zero_pad(&mut encoded, bytes.len());
    }
    Ok(encoded)
}

fn encode_center_f16_lebytes(packed: &[u32], base: usize, count: usize) -> Vec<u8> {
    let mut bytes = Vec::with_capacity(count * 6);
    for byte_index in 0..2 {
        for component in 0..3 {
            for i in 0..count {
                let half = center_half(packed, base + i, component);
                bytes.push(((half >> (byte_index * 8)) & 0xff) as u8);
            }
        }
    }
    bytes
}

fn center_half(packed: &[u32], index: usize, component: usize) -> u16 {
    let i4 = index * 4;
    match component {
        0 => (packed[i4 + 1] & 0xffff) as u16,
        1 => (packed[i4 + 1] >> 16) as u16,
        _ => (packed[i4 + 2] & 0xffff) as u16,
    }
}

fn encode_alpha_r8(packed: &[u32], base: usize, count: usize) -> Vec<u8> {
    let mut bytes = Vec::with_capacity(count);
    for i in 0..count {
        bytes.push(((packed[(base + i) * 4] >> 24) & 0xff) as u8);
    }
    bytes
}

fn encode_rgb_r8(packed: &[u32], base: usize, count: usize) -> Vec<u8> {
    let mut bytes = Vec::with_capacity(count * 3);
    for component in 0..3 {
        for i in 0..count {
            bytes.push(((packed[(base + i) * 4] >> (component * 8)) & 0xff) as u8);
        }
    }
    bytes
}

fn encode_scales_ln_0r8(packed: &[u32], base: usize, count: usize) -> Vec<u8> {
    let mut bytes = Vec::with_capacity(count * 3);
    for component in 0..3 {
        for i in 0..count {
            bytes.push(((packed[(base + i) * 4 + 3] >> (component * 8)) & 0xff) as u8);
        }
    }
    bytes
}

fn encode_orientation_oct88r8(packed: &[u32], base: usize, count: usize) -> Vec<u8> {
    let mut bytes = Vec::with_capacity(count * 3);
    for i in 0..count {
        let i4 = (base + i) * 4;
        bytes.push(((packed[i4 + 2] >> 16) & 0xff) as u8);
        bytes.push(((packed[i4 + 2] >> 24) & 0xff) as u8);
        bytes.push(((packed[i4 + 3] >> 24) & 0xff) as u8);
    }
    bytes
}

fn encode_child_count_u16(lod_tree: &[u32], base: usize, count: usize) -> Vec<u8> {
    let mut bytes = Vec::with_capacity(count * 2);
    for i in 0..count {
        let child_count = (lod_tree[(base + i) * 4 + 2] & 0xffff) as u16;
        bytes.extend_from_slice(&child_count.to_le_bytes());
    }
    bytes
}

fn encode_child_start_u32(lod_tree: &[u32], base: usize, count: usize) -> Vec<u8> {
    let mut bytes = Vec::with_capacity(count * 4);
    for i in 0..count {
        let child_start = lod_tree[(base + i) * 4 + 3];
        bytes.extend_from_slice(&child_start.to_le_bytes());
    }
    bytes
}

fn safe_sh_max(value: f64) -> f64 {
    if value.is_finite() && value > 0.0 {
        value
    } else {
        1.0
    }
}

fn encode_sh1_s8(sh1: &[u32], base: usize, count: usize, max: f64) -> Vec<u8> {
    let mut bytes = Vec::with_capacity(count * 9);
    for component in 0..9 {
        for i in 0..count {
            let value = decode_sh1_value(sh1, base + i, component, max);
            bytes.push(encode_s8_byte(value, max));
        }
    }
    bytes
}

fn encode_sh2_s8(sh2: &[u32], base: usize, count: usize, max: f64) -> Vec<u8> {
    let mut bytes = Vec::with_capacity(count * 15);
    for component in 0..15 {
        for i in 0..count {
            let value = decode_sh2_value(sh2, base + i, component, max);
            bytes.push(encode_s8_byte(value, max));
        }
    }
    bytes
}

fn encode_sh3_s8(sh3: &[u32], base: usize, count: usize, max: f64) -> Vec<u8> {
    let mut bytes = Vec::with_capacity(count * 21);
    for component in 0..21 {
        for i in 0..count {
            let value = decode_sh3_value(sh3, base + i, component, max);
            bytes.push(encode_s8_byte(value, max));
        }
    }
    bytes
}

fn decode_sh1_value(sh1: &[u32], index: usize, component: usize, max: f64) -> f64 {
    let base = index * 2;
    let bit_start = component * 7;
    let word_start = bit_start / 32;
    let bit_offset = bit_start % 32;
    let lo = sh1[base + word_start] as u64;
    let hi = sh1.get(base + word_start + 1).copied().unwrap_or(0) as u64;
    let raw = ((lo | (hi << 32)) >> bit_offset) & 0x7f;
    let signed = sign_extend(raw as u32, 7) as f64;
    signed / 63.0 * max
}

fn decode_sh2_value(sh2: &[u32], index: usize, component: usize, max: f64) -> f64 {
    let word = sh2[index * 4 + component / 4];
    let raw = ((word >> ((component % 4) * 8)) & 0xff) as u8;
    (raw as i8 as f64) / 127.0 * max
}

fn decode_sh3_value(sh3: &[u32], index: usize, component: usize, max: f64) -> f64 {
    let base = index * 4;
    let bit_start = component * 6;
    let word_start = bit_start / 32;
    let bit_offset = bit_start % 32;
    let lo = sh3[base + word_start] as u64;
    let hi = sh3.get(base + word_start + 1).copied().unwrap_or(0) as u64;
    let raw = ((lo | (hi << 32)) >> bit_offset) & 0x3f;
    let signed = sign_extend(raw as u32, 6) as f64;
    signed / 31.0 * max
}

fn sign_extend(value: u32, bits: u8) -> i32 {
    let sign = 1u32 << (bits - 1);
    ((value ^ sign) as i32) - sign as i32
}

fn encode_s8_byte(value: f64, max: f64) -> u8 {
    let quantized = (value / max * 127.0).clamp(-127.0, 127.0).round() as i8;
    quantized as u8
}

fn write_rad_root(output: &mut Vec<u8>, meta: &Value) -> Result<(), JsValue> {
    let mut meta_bytes =
        serde_json::to_vec_pretty(meta).map_err(|error| JsValue::from_str(&error.to_string()))?;
    meta_bytes.push(b'\n');
    output.extend_from_slice(&RAD_MAGIC);
    output.extend_from_slice(&(meta_bytes.len() as u32).to_le_bytes());
    output.extend_from_slice(&meta_bytes);
    write_zero_pad(output, meta_bytes.len());
    Ok(())
}

fn entry_object(name: &str, bytes: Vec<u8>) -> JsValue {
    let object = Object::new();
    let size = bytes.len();
    let array = Uint8Array::from(bytes.as_slice());
    let _ = Reflect::set(&object, &JsValue::from_str("name"), &JsValue::from_str(name));
    let _ = Reflect::set(&object, &JsValue::from_str("bytes"), &array);
    let _ = Reflect::set(
        &object,
        &JsValue::from_str("size"),
        &JsValue::from_f64(size as f64),
    );
    object.into()
}

fn roundup8(size: usize) -> usize {
    (size + 7) & !7
}

fn pad8(size: usize) -> usize {
    (8 - (size & 7)) & 7
}

fn write_zero_pad(output: &mut Vec<u8>, unpadded_size: usize) {
    let pad = pad8(unpadded_size);
    if pad > 0 {
        output.extend_from_slice(&[0u8; 8][..pad]);
    }
}
