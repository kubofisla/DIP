#ifdef GL_ES
precision highp float;
            #endif

uniform sampler2D frontFace;
uniform sampler2D backFace;
uniform sampler2D volume;

uniform vec2 size;
uniform float alphaMultiplier;

float step = 0.004;

void main()
{
    vec4 value;
    vec4 result = vec4(0.0);

    vec4 fragCoord = vec4(gl_FragCoord.xy/size, 0.0, 0.0);
    vec3 frontPos = texture2D(frontFace, fragCoord.xy).rgb;
    vec3 backPos = texture2D(backFace, fragCoord.xy).rgb;
    vec3 direction = normalize(backPos - frontPos);
                    
    vec3 actualPos = frontPos;

    //if(length(direction) <= 0)
    //return result;

    int steps = int(floor(length(direction)/step));
    vec3 diff1 = direction / float(steps);
    float alfa = 0.0;

    for (int i=0; i < 20000; i++) {
        value.rgb = texture2D(volume, actualPos.xy).rgb;
        value.a = ((0.2126*value.r + 0.7152*value.g + 0.0722*value.b)*alphaMultiplier);
        alfa += value.a;
        if(alfa >= 1.0)
    {
            alfa = 1.0;
            break;
    }

    result.rgb += (1.0-result.a)*value.a*value.rgb;

    actualPos += diff1;
    if(i >= steps || actualPos.x > 1.0 || actualPos.x < 0.0 || actualPos.y > 1.0 || actualPos.y < 0.0 || actualPos.z > 1.0 || actualPos.z < 0.0 )
        break;
    }

    //gl_FragColor = result;
    gl_FragColor=vec4(vec3(1.0,1.0,1.0)*alfa, 1.0);
}
