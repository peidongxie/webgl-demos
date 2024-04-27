precision mediump float;
uniform sampler2D u_Sampler;
uniform vec3 u_LightColor;
varying float v_NdotL;
varying vec2 v_TexCoord;
void main() {
  vec4 color = texture2D(u_Sampler, v_TexCoord);
  vec3 diffuse = u_LightColor * color.rgb * v_NdotL;
  gl_FragColor = vec4(diffuse, color.a);
}
