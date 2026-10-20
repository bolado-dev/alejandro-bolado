// --- Component ---
"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export type GlitchPortraitTheme = "light" | "dark" | "auto";

export type GlitchPortraitOptions = {
  /** Portrait to glitch. Cut-out PNG/WebP with alpha works best. */
  src: string;
  /** Slip rows. Default `44` */
  rows?: number;
  /** Horizontal slip distance in UV. Default `0.014` */
  tear?: number;
  /** Fraction of rows that slip, 0–1. Default `0.5` */
  tearDensity?: number;
  /** RGB channel split in UV. Default `0.003` */
  rgbSplit?: number;
  /** How much the reveal edge steps per row, 0–1. Default `0.3` */
  dither?: number;
  /** Brush size 0–1. Default `0.5` */
  brush?: number;
  /** Trail strength. Default `1` */
  force?: number;
  /** How fast the displacement settles (0–1, higher = longer). Default `0.94` */
  decay?: number;
  /** How fast the revealed area closes back (0–1). Default `0.975` */
  heatDecay?: number;
  /** Sobel sampling radius in screen pixels. Default `1.3` */
  edgeWidth?: number;
  /** How much the alpha contour counts vs. luminance detail. Default `0.55` */
  alphaWeight?: number;
  /** Sobel gate — below `edgeLow` no line, above `edgeHigh` full line. */
  edgeLow?: number;
  edgeHigh?: number;
  /** Opacity of the flat fill inside the silhouette. Default `0.96` */
  fill?: number;
  /** Scanline intensity 0–1. Default `0.06` */
  scanlines?: number;
  /** Line color (hex). Default follows theme. */
  lineColor?: string;
  /** Fill color (hex). Default follows theme. */
  fillColor?: string;
  /** Bottom fade height, 0–1 of the box. Default `0.12` */
  bottomFade?: number;
  /** Drift a ghost pointer when untouched / on touch devices. Default `false` */
  autoDemo?: boolean;
  /** Follow the real pointer. Default `true` */
  interactive?: boolean;
  /** Palette mode. Default `auto` follows next-themes (`html.dark`). */
  theme?: GlitchPortraitTheme;
};

export type GlitchPortraitInstance = {
  setOptions: (options: Partial<GlitchPortraitOptions>) => void;
  destroy: () => void;
};

const LIGHT = { line: "#0a0a0a", fill: "#fafafa" };
const DARK = { line: "#fafafa", fill: "#0a0a0a" };

const VERT = `
attribute vec2 a_position;
varying vec2 v_uv;
void main() {
  v_uv = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

// Flowmap: rg = pointer velocity (enc v*0.5+0.5), b = reveal heat. Nothing
// here displaces the image — the display pass reads this purely as "where,
// and how hard". The 5-tap diffusion spreads the trail past the brush.
const FRAG_FLOW = `
precision highp float;
varying vec2 v_uv;
uniform sampler2D u_flow;
uniform vec2 u_texel;
uniform vec2 u_point;
uniform vec2 u_vel;
uniform float u_radius;
uniform float u_aspect;
uniform float u_decay;
uniform float u_heatDecay;
uniform float u_amount;

vec2 dec(vec2 e) { return e * 2.0 - 1.0; }
vec2 enc(vec2 v) { return clamp(v * 0.5 + 0.5, 0.0, 1.0); }

void main() {
  vec4 c = texture2D(u_flow, v_uv);
  vec4 n = texture2D(u_flow, v_uv + vec2(0.0, u_texel.y));
  vec4 s = texture2D(u_flow, v_uv - vec2(0.0, u_texel.y));
  vec4 e = texture2D(u_flow, v_uv + vec2(u_texel.x, 0.0));
  vec4 w = texture2D(u_flow, v_uv - vec2(u_texel.x, 0.0));

  vec2 flow =
    dec(c.xy) * 0.6 +
    (dec(n.xy) + dec(s.xy) + dec(e.xy) + dec(w.xy)) * 0.1;
  float heat = c.z * 0.6 + (n.z + s.z + e.z + w.z) * 0.1;

  flow *= u_decay;
  heat *= u_heatDecay;

  vec2 p = v_uv - u_point;
  p.x *= u_aspect;
  float d = exp(-dot(p, p) / max(u_radius, 0.00001)) * u_amount;

  flow += u_vel * d;
  heat = min(heat + d * 1.15, 1.0);

  gl_FragColor = vec4(enc(flow), heat, 1.0);
}
`;

// Display: the flowmap only says WHERE and HOW HARD to glitch — there is no
// continuous UV warp, so the face never bends, and no grid snapping, so it
// never pixelates. What the pointer leaves behind is whole rows slipping
// sideways plus an RGB split, both fixed per row.
const FRAG_DISPLAY = `
precision highp float;
varying vec2 v_uv;
uniform sampler2D u_flow;
uniform sampler2D u_photo;
uniform vec2 u_edgeStep;
uniform float u_alphaWeight;
uniform vec2 u_fit;
uniform vec2 u_fitOffset;
uniform float u_rows;
uniform float u_tear;
uniform float u_tearDensity;
uniform float u_rgbSplit;
uniform float u_dither;
uniform float u_edgeWidth;
uniform float u_edgeLow;
uniform float u_edgeHigh;
uniform float u_fill;
uniform float u_scanlines;
uniform float u_bottomFade;
uniform float u_time;
uniform float u_pixelHeight;
uniform vec3 u_line;
uniform vec3 u_fillColor;

float hash21(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

// The subject is a dark cut-out, so luminance alone has no gradient across
// the sweater's contour (black against transparent black). Giving alpha its
// own floor restores the silhouette while luminance keeps the inner detail.
float field(vec4 c) {
  float l = dot(c.rgb, vec3(0.299, 0.587, 0.114));
  return c.a * (u_alphaWeight + (1.0 - u_alphaWeight) * l);
}

void main() {
  vec4 fl = texture2D(u_flow, v_uv);
  vec2 flow = fl.xy * 2.0 - 1.0;
  float heat = fl.z;

  vec2 base = (v_uv - 0.5) * u_fit + 0.5 + u_fitOffset;

  // Every offset below is a fixed function of position, never of time: a
  // re-rolled hash would read as flicker. Rows slide out as the heat rises
  // and slide back as it decays — displacement, not blinking.
  float row = floor(base.y * u_rows);
  float rowNoise = hash21(vec2(row, 23.0));

  // The reveal edge steps in horizontal bands rather than fading smoothly,
  // which keeps it in the same language as the slip. The dither has to scale
  // the heat, not offset it: added, a high-noise row would sit permanently
  // lit at zero heat.
  float g = smoothstep(
    0.04, 0.40, heat * (1.0 + (rowNoise - 0.5) * u_dither * 2.0));
  float push = min(1.0, g * (0.65 + length(flow) * 0.9));

  // Row slip on a fraction of the rows only. No quantization anywhere —
  // the image is translated, never resampled onto a coarser grid.
  vec2 uv = base;
  float pick = hash21(vec2(row, 3.0));
  float tear = step(1.0 - u_tearDensity, pick) * (hash21(vec2(row, 7.0)) - 0.5);
  uv.x += tear * u_tear * push;

  // Hard-stepped RGB split, per row
  float split = u_rgbSplit * push * (0.4 + 0.6 * hash21(vec2(row, 13.0)));
  vec4 pr = texture2D(u_photo, uv + vec2(split, 0.0));
  vec4 pg = texture2D(u_photo, uv);
  vec4 pb = texture2D(u_photo, uv - vec2(split, 0.0));
  vec3 photo = vec3(pr.r, pg.g, pb.b);
  float alpha = pg.a;

  // Sobel in screen-pixel steps, so line weight stays constant at any size
  vec2 t = u_edgeStep * u_edgeWidth;
  float l00 = field(texture2D(u_photo, uv + vec2(-t.x, -t.y)));
  float l10 = field(texture2D(u_photo, uv + vec2( 0.0, -t.y)));
  float l20 = field(texture2D(u_photo, uv + vec2( t.x, -t.y)));
  float l01 = field(texture2D(u_photo, uv + vec2(-t.x,  0.0)));
  float l21 = field(texture2D(u_photo, uv + vec2( t.x,  0.0)));
  float l02 = field(texture2D(u_photo, uv + vec2(-t.x,  t.y)));
  float l12 = field(texture2D(u_photo, uv + vec2( 0.0,  t.y)));
  float l22 = field(texture2D(u_photo, uv + vec2( t.x,  t.y)));

  float gx = (l20 + 2.0 * l21 + l22) - (l00 + 2.0 * l01 + l02);
  float gy = (l02 + 2.0 * l12 + l22) - (l00 + 2.0 * l10 + l20);
  float grad = sqrt(gx * gx + gy * gy);
  float edge = smoothstep(u_edgeLow, u_edgeHigh, grad);

  // Horizontal scanlines drifting slowly upward
  float scan = 0.5 + 0.5 * sin(v_uv.y * u_pixelHeight * 1.1 - u_time * 2.2);
  float scanMask = 1.0 - u_scanlines * scan;

  // Scanlines ride the line only. Modulating the fill's alpha too would
  // punch holes in the silhouette and let the page background read through.
  float lineMask = edge * scanMask;
  vec3 cyber = mix(u_fillColor, u_line, lineMask);
  float cyberAlpha = max(lineMask, alpha * u_fill);

  vec3 col = mix(photo, cyber, g);
  float a = mix(alpha, cyberAlpha, g);

  // Contain-fit guard + the bottom fade the CSS mask used to do
  vec2 inside = step(vec2(0.0), base) * step(base, vec2(1.0));
  a *= inside.x * inside.y;
  a *= smoothstep(0.0, max(u_bottomFade, 0.001), v_uv.y);

  gl_FragColor = vec4(col, clamp(a, 0.0, 1.0));
}
`;

function isDev() {
  return (
    typeof process !== "undefined" && process.env?.NODE_ENV !== "production"
  );
}

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "").trim();
  const full =
    h.length === 3
      ? h
          .split("")
          .map((c) => c + c)
          .join("")
      : h.padEnd(6, "0").slice(0, 6);
  const n = Number.parseInt(full, 16);
  if (Number.isNaN(n)) return [1, 1, 1];
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

function isDarkTheme(): boolean {
  if (typeof document === "undefined") return false;
  const root = document.documentElement;
  if (root.classList.contains("dark")) return true;
  if (root.classList.contains("light")) return false;
  const dataTheme = root.getAttribute("data-theme");
  if (dataTheme === "dark") return true;
  if (dataTheme === "light") return false;
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function resolveDark(theme: GlitchPortraitTheme): boolean {
  if (theme === "dark") return true;
  if (theme === "light") return false;
  return isDarkTheme();
}

function compile(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    if (isDev()) {
      console.warn(
        "GlitchPortrait: shader failed to compile\n",
        gl.getShaderInfoLog(shader),
      );
    }
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

function createProgram(
  gl: WebGLRenderingContext,
  vs: WebGLShader,
  fragSource: string,
) {
  const fs = compile(gl, gl.FRAGMENT_SHADER, fragSource);
  if (!fs) return null;
  const program = gl.createProgram();
  if (!program) {
    gl.deleteShader(fs);
    return null;
  }
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    if (isDev()) {
      console.warn(
        "GlitchPortrait: program failed to link\n",
        gl.getProgramInfoLog(program),
      );
    }
    gl.deleteProgram(program);
    gl.deleteShader(fs);
    return null;
  }
  return { program, fs };
}

type FBO = { tex: WebGLTexture; fbo: WebGLFramebuffer; w: number; h: number };

function createFBO(
  gl: WebGLRenderingContext,
  w: number,
  h: number,
): FBO | null {
  const tex = gl.createTexture();
  const fbo = gl.createFramebuffer();
  if (!tex || !fbo) return null;
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    gl.RGBA,
    w,
    h,
    0,
    gl.RGBA,
    gl.UNSIGNED_BYTE,
    null,
  );
  gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
  gl.framebufferTexture2D(
    gl.FRAMEBUFFER,
    gl.COLOR_ATTACHMENT0,
    gl.TEXTURE_2D,
    tex,
    0,
  );
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  return { tex, fbo, w, h };
}

function createDoubleFBO(gl: WebGLRenderingContext, w: number, h: number) {
  const a = createFBO(gl, w, h);
  const b = createFBO(gl, w, h);
  if (!a || !b) return null;
  return {
    read: a,
    write: b,
    swap() {
      const t = this.read;
      this.read = this.write;
      this.write = t;
    },
  };
}

/**
 * Glitch portrait — a pointer-driven flowmap decides where a cut-out photo
 * slips into a Sobel line-art version of itself. Both layers come from the
 * same texture, so they stay registered pixel-for-pixel; rows translate but
 * nothing is ever warped or quantized. Zero deps.
 */
export function createGlitchPortrait(
  canvas: HTMLCanvasElement,
  image: HTMLImageElement,
  initial: GlitchPortraitOptions,
): GlitchPortraitInstance | null {
  let options: Required<Omit<GlitchPortraitOptions, "lineColor" | "fillColor">> &
    GlitchPortraitOptions = {
    rows: 44,
    tear: 0.014,
    tearDensity: 0.5,
    rgbSplit: 0.003,
    dither: 0.3,
    brush: 0.5,
    force: 1,
    decay: 0.94,
    heatDecay: 0.975,
    edgeWidth: 1.3,
    alphaWeight: 0.55,
    edgeLow: 0.35,
    edgeHigh: 1.1,
    fill: 0.96,
    scanlines: 0.06,
    bottomFade: 0.12,
    autoDemo: false,
    interactive: true,
    theme: "auto",
    ...initial,
  };

  const mouse = { x: 0.5, y: 0.5, dx: 0, dy: 0, moved: false, inside: false };
  let touched = false;
  let reduce = false;

  const gl = canvas.getContext("webgl", {
    alpha: true,
    premultipliedAlpha: false,
    antialias: false,
    depth: false,
    stencil: false,
    powerPreference: "low-power",
    preserveDrawingBuffer: false,
  });
  if (!gl) return null;

  const vs = compile(gl, gl.VERTEX_SHADER, VERT);
  if (!vs) return null;

  const flowProg = createProgram(gl, vs, FRAG_FLOW);
  const displayProg = createProgram(gl, vs, FRAG_DISPLAY);
  if (!flowProg || !displayProg) return null;

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
    gl.STATIC_DRAW,
  );

  const bindQuad = (program: WebGLProgram) => {
    gl.useProgram(program);
    const loc = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  };

  // Portrait-shaped sim grid keeps the diffusion isotropic on screen
  const SIM_W = 192;
  const SIM_H = 256;
  const flow = createDoubleFBO(gl, SIM_W, SIM_H);
  if (!flow) return null;

  const photoTex = gl.createTexture();
  if (!photoTex) return null;
  gl.bindTexture(gl.TEXTURE_2D, photoTex);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 0);

  const imgW = image.naturalWidth || 1;
  const imgH = image.naturalHeight || 1;

  const blit = (target: FBO | null) => {
    if (target) {
      gl.bindFramebuffer(gl.FRAMEBUFFER, target.fbo);
      gl.viewport(0, 0, target.w, target.h);
    } else {
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
    }
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  };

  const clearFbo = (fbo: FBO) => {
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo.fbo);
    gl.viewport(0, 0, fbo.w, fbo.h);
    gl.clearColor(0.5, 0.5, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
  };
  clearFbo(flow.read);
  clearFbo(flow.write);

  let raf = 0;
  let running = true;
  let visible = true;
  let last = performance.now();
  const start = last;

  const resize = () => {
    const parent = canvas.parentElement;
    if (!parent) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = parent.clientWidth;
    const h = parent.clientHeight;
    if (w <= 0 || h <= 0) return;
    canvas.width = Math.max(1, Math.floor(w * dpr));
    canvas.height = Math.max(1, Math.floor(h * dpr));
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
  };

  resize();
  const ro = new ResizeObserver(resize);
  const parentEl = canvas.parentElement;
  if (parentEl) ro.observe(parentEl);

  const io = new IntersectionObserver(
    (entries) => {
      visible = entries.some((entry) => entry.isIntersecting);
    },
    { rootMargin: "120px" },
  );
  if (parentEl) io.observe(parentEl);

  const mqReduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  const onReduce = () => {
    reduce = mqReduce.matches;
  };
  onReduce();
  mqReduce.addEventListener("change", onReduce);

  const mqHover = window.matchMedia("(hover: hover) and (pointer: fine)");

  const onPointer = (e: PointerEvent) => {
    if (!options.interactive || !parentEl) return;
    const rect = parentEl.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;
    const x = (e.clientX - rect.left) / rect.width;
    const y = 1 - (e.clientY - rect.top) / rect.height;
    // A margin outside the box keeps the trail alive at the silhouette edge
    mouse.inside = x > -0.3 && x < 1.3 && y > -0.3 && y < 1.3;
    if (mouse.inside) touched = true;
    mouse.dx = x - mouse.x;
    mouse.dy = y - mouse.y;
    mouse.x = x;
    mouse.y = y;
    mouse.moved = true;
  };
  const onLeave = () => {
    mouse.inside = false;
  };

  window.addEventListener("pointermove", onPointer, { passive: true });
  parentEl?.addEventListener("pointerleave", onLeave, { passive: true });

  const splat = (
    px: number,
    py: number,
    vx: number,
    vy: number,
    amount: number,
    radius: number,
    aspect: number,
    decay: number,
    heatDecay: number,
    texel: readonly [number, number],
  ) => {
    bindQuad(flowProg.program);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, flow.read.tex);
    const u = (name: string) => gl.getUniformLocation(flowProg.program, name);
    gl.uniform1i(u("u_flow"), 0);
    gl.uniform2f(u("u_texel"), texel[0], texel[1]);
    gl.uniform2f(u("u_point"), px, py);
    gl.uniform2f(u("u_vel"), vx, vy);
    gl.uniform1f(u("u_radius"), radius);
    gl.uniform1f(u("u_aspect"), aspect);
    gl.uniform1f(u("u_decay"), decay);
    gl.uniform1f(u("u_heatDecay"), heatDecay);
    gl.uniform1f(u("u_amount"), amount);
    blit(flow.write);
    flow.swap();
  };

  const tick = (now: number) => {
    if (!running) return;
    const dt = Math.min((now - last) / 1000, 0.033);
    last = now;
    const time = (now - start) / 1000;
    const p = options;

    if (!visible) {
      raf = requestAnimationFrame(tick);
      return;
    }

    const dark = resolveDark(p.theme);
    const line = hexToRgb(p.lineColor ?? (dark ? DARK.line : LIGHT.line));
    const fillColor = hexToRgb(p.fillColor ?? (dark ? DARK.fill : LIGHT.fill));
    const texel = [1 / SIM_W, 1 / SIM_H] as const;
    const aspect = canvas.width / Math.max(canvas.height, 1);
    const radius = 0.0012 + Math.max(0.05, Math.min(1, p.brush)) * 0.012;
    // Frame-rate independent decay
    const steps = dt * 60;
    const decay = Math.pow(Math.min(0.999, p.decay), steps);
    const heatDecay = Math.pow(Math.min(0.999, p.heatDecay), steps);

    let splatted = false;
    if (!reduce && p.interactive && mouse.moved && mouse.inside) {
      const speed = Math.hypot(mouse.dx, mouse.dy);
      const strength = p.force * (2.2 + speed * 26);
      splat(
        mouse.x,
        mouse.y,
        mouse.dx * strength,
        mouse.dy * strength,
        Math.min(1.2, 0.5 + speed * 7),
        radius,
        aspect,
        decay,
        heatDecay,
        texel,
      );
      mouse.moved = false;
      mouse.dx = 0;
      mouse.dy = 0;
      splatted = true;
    }

    // Ghost pointer: discoverability on desktop before the first hover,
    // and the only way the effect exists at all on touch.
    const ghost = p.autoDemo && !reduce && (!mqHover.matches || !touched);
    if (ghost && !mouse.inside) {
      const gx = 0.5 + Math.sin(time * 0.62) * 0.2;
      const gy = 0.56 + Math.cos(time * 0.47) * 0.2;
      const vx = Math.cos(time * 0.62) * 0.62 * 0.2;
      const vy = -Math.sin(time * 0.47) * 0.47 * 0.2;
      splat(
        gx,
        gy,
        vx * p.force * 2.4,
        vy * p.force * 2.4,
        0.5,
        radius,
        aspect,
        decay,
        heatDecay,
        texel,
      );
      splatted = true;
    }

    // Always advance the field so trails keep decaying and diffusing
    if (!splatted && !reduce) {
      splat(0, 0, 0, 0, 0, radius, aspect, decay, heatDecay, texel);
    }

    bindQuad(displayProg.program);
    const u = (name: string) => gl.getUniformLocation(displayProg.program, name);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, flow.read.tex);
    gl.uniform1i(u("u_flow"), 0);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, photoTex);
    gl.uniform1i(u("u_photo"), 1);

    // object-contain + object-bottom, matching the previous <img>
    const imgAspect = imgW / imgH;
    const boxAspect = aspect;
    const fitX = boxAspect > imgAspect ? boxAspect / imgAspect : 1;
    const fitY = boxAspect > imgAspect ? 1 : imgAspect / boxAspect;
    gl.uniform2f(u("u_fit"), fitX, fitY);
    gl.uniform2f(u("u_fitOffset"), 0, (fitY - 1) * 0.5);

    gl.uniform2f(
      u("u_edgeStep"),
      fitX / Math.max(canvas.width, 1),
      fitY / Math.max(canvas.height, 1),
    );
    gl.uniform1f(u("u_alphaWeight"), p.alphaWeight);
    gl.uniform1f(u("u_rows"), p.rows);
    gl.uniform1f(u("u_tear"), reduce ? 0 : p.tear);
    gl.uniform1f(u("u_tearDensity"), p.tearDensity);
    gl.uniform1f(u("u_rgbSplit"), reduce ? 0 : p.rgbSplit);
    gl.uniform1f(u("u_dither"), reduce ? 0 : p.dither);
    gl.uniform1f(u("u_edgeWidth"), p.edgeWidth);
    gl.uniform1f(u("u_edgeLow"), p.edgeLow);
    gl.uniform1f(u("u_edgeHigh"), p.edgeHigh);
    gl.uniform1f(u("u_fill"), p.fill);
    gl.uniform1f(u("u_scanlines"), reduce ? 0 : p.scanlines);
    gl.uniform1f(u("u_bottomFade"), p.bottomFade);
    gl.uniform1f(u("u_time"), time);
    gl.uniform1f(u("u_pixelHeight"), canvas.height);
    gl.uniform3f(u("u_line"), line[0], line[1], line[2]);
    gl.uniform3f(u("u_fillColor"), fillColor[0], fillColor[1], fillColor[2]);
    blit(null);

    raf = requestAnimationFrame(tick);
  };

  raf = requestAnimationFrame(tick);

  return {
    setOptions(next) {
      options = { ...options, ...next };
    },
    destroy() {
      running = false;
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      mqReduce.removeEventListener("change", onReduce);
      window.removeEventListener("pointermove", onPointer);
      parentEl?.removeEventListener("pointerleave", onLeave);
      gl.deleteProgram(flowProg.program);
      gl.deleteProgram(displayProg.program);
      gl.deleteShader(vs);
      gl.deleteShader(flowProg.fs);
      gl.deleteShader(displayProg.fs);
      gl.deleteBuffer(buf);
      gl.deleteTexture(photoTex);
      for (const f of [flow.read, flow.write]) {
        gl.deleteTexture(f.tex);
        gl.deleteFramebuffer(f.fbo);
      }
    },
  };
}

export type GlitchPortraitProps = GlitchPortraitOptions & {
  alt: string;
  className?: string;
};

/**
 * Glitch portrait — a pointer-driven flowmap decides where a cut-out photo
 * slips into a Sobel line-art version of itself. Falls back to the plain
 * image without WebGL or under `prefers-reduced-motion`.
 */
export function GlitchPortrait({
  src,
  alt,
  className,
  rows = 44,
  tear = 0.014,
  tearDensity = 0.5,
  rgbSplit = 0.003,
  dither = 0.3,
  brush = 0.5,
  force = 1,
  decay = 0.94,
  heatDecay = 0.975,
  edgeWidth = 1.3,
  alphaWeight = 0.55,
  edgeLow = 0.35,
  edgeHigh = 1.1,
  fill = 0.96,
  scanlines = 0.06,
  lineColor,
  fillColor,
  bottomFade = 0.12,
  autoDemo = false,
  interactive = true,
  theme = "auto",
}: GlitchPortraitProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const instanceRef = useRef<GlitchPortraitInstance | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let cancelled = false;

    const image = new Image();
    image.crossOrigin = "anonymous";
    image.decoding = "async";
    image.src = src;

    const boot = () => {
      if (cancelled || !canvasRef.current) return;
      instanceRef.current = createGlitchPortrait(canvasRef.current, image, {
        src,
        rows,
        tear,
        tearDensity,
        rgbSplit,
        dither,
        brush,
        force,
        decay,
        heatDecay,
        edgeWidth,
        alphaWeight,
        edgeLow,
        edgeHigh,
        fill,
        scanlines,
        lineColor,
        fillColor,
        bottomFade,
        autoDemo,
        interactive,
        theme,
      });
      if (instanceRef.current) setReady(true);
    };

    image
      .decode()
      .then(boot)
      .catch(() => {
        // Safari can reject decode() on a cached image; fall back to onload
        if (image.complete && image.naturalWidth > 0) boot();
        else image.onload = boot;
      });

    return () => {
      cancelled = true;
      instanceRef.current?.destroy();
      instanceRef.current = null;
      setReady(false);
    };
    // Engine reads live options via setOptions; mount once per src.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src]);

  useEffect(() => {
    instanceRef.current?.setOptions({
      rows,
      tear,
      tearDensity,
      rgbSplit,
      dither,
      brush,
      force,
      decay,
      heatDecay,
      edgeWidth,
      alphaWeight,
      edgeLow,
      edgeHigh,
      fill,
      scanlines,
      lineColor,
      fillColor,
      bottomFade,
      autoDemo,
      interactive,
      theme,
    });
  }, [
    rows,
    tear,
    tearDensity,
    rgbSplit,
    dither,
    brush,
    force,
    decay,
    heatDecay,
    edgeWidth,
    alphaWeight,
    edgeLow,
    edgeHigh,
    fill,
    scanlines,
    lineColor,
    fillColor,
    bottomFade,
    autoDemo,
    interactive,
    theme,
  ]);

  return (
    <div
      data-slot="glitch-portrait"
      className={cn("relative overflow-hidden", className)}
    >
      {/* Rendered for SSR, a11y and as the no-WebGL fallback */}
      <img
        src={src}
        alt={alt}
        className="h-full w-full object-contain object-bottom transition-opacity duration-500"
        style={{
          opacity: ready ? 0 : 1,
          maskImage: "linear-gradient(to bottom, black 88%, transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(to bottom, black 88%, transparent 100%)",
        }}
      />
      <canvas
        ref={canvasRef}
        aria-hidden
        className="absolute inset-0 size-full"
        style={{ opacity: ready ? 1 : 0 }}
      />
    </div>
  );
}

export default GlitchPortrait;
