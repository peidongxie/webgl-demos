precision mediump float;
uniform vec3 u_LightColor;
uniform vec3 u_LightDirection;
varying vec3 v_Normal;
varying vec4 v_Color;
void main() {
  vec3 normal = normalize(v_Normal);
  float nDotL = max(dot(u_LightDirection, normal), 0.0);
  vec3 diffuse = u_LightColor * v_Color.rgb * nDotL;
  gl_FragColor = vec4(diffuse, v_Color.a);
}
