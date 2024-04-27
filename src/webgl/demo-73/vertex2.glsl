attribute vec4 a_Position;
attribute vec2 a_TexCoord;
attribute vec4 a_Normal;
uniform mat4 u_MvpMatrix;
uniform mat4 u_NormalMatrix;
uniform vec3 u_LightDirection;
varying float v_NdotL;
varying vec2 v_TexCoord;
void main() {
  gl_Position = u_MvpMatrix * a_Position;
  vec3 normal = normalize(vec3(u_NormalMatrix * a_Normal));
  v_NdotL = max(dot(u_LightDirection, normal), 0.0);
  v_TexCoord = a_TexCoord;
}
