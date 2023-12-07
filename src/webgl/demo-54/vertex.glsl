attribute vec4 a_Position;
attribute vec4 a_Color;
attribute vec4 a_Normal;
uniform mat4 u_MvpMatrix;
uniform mat4 u_NormalMatrix;
uniform vec3 u_LightDirection;
varying vec4 v_Color;
void main() {
  gl_Position = u_MvpMatrix * a_Position;
  vec4 normal = u_NormalMatrix * a_Normal;
  float nDotL = max(dot(u_LightDirection, normalize(normal.xyz)), 0.0);
  v_Color = vec4(a_Color.xyz * nDotL, a_Color.a);
}
