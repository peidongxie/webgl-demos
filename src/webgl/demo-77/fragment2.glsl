precision mediump float;
uniform sampler2D u_ShadowMap;
varying vec4 v_PositionFromLight;
varying vec4 v_Color;
float unpackDepth(const in vec4 rgbaDepth) {
  const vec4 bitShift = vec4(1.0, 1.0 / 256.0, 1.0 / (256.0 * 256.0), 1.0 / (256.0 * 256.0 * 256.0));
  float depth = dot(rgbaDepth, bitShift);
  return depth;
}
void main() {
  vec3 shadowCoord = (v_PositionFromLight.xyz / v_PositionFromLight.w) / 2.0 + 0.5;
  vec4 rgbaDepth = texture2D(u_ShadowMap, shadowCoord.xy);
  float depth = unpackDepth(rgbaDepth);
  float visibility = (shadowCoord.z > depth + 0.0015) ? 0.7 : 1.0;
  gl_FragColor = vec4(v_Color.rgb * visibility, v_Color.a);
}
