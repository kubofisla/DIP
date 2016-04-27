uniform sampler2D frontFace;
uniform sampler2D backFace;

uniform sampler2D volume1;
uniform sampler2D volume2;
uniform sampler2D volume3;
uniform sampler2D volume4;

uniform sampler2D transferFce;

uniform vec2 size;
uniform float alphaMultiplier;
uniform int cntInRow;
uniform float step;
uniform float zSize;
uniform float texelSize;
uniform vec3 lightPos;

const float SpecularContribution = 0.0;
const float DiffuseContribution = 1.0 - SpecularContribution;

//vec3 lightPos = vec3(10., -10., -10.);

float zCount;

vec3 direction;
int textureIndex = 0;
float partSide;

float actualIntensity;
vec4 actualPoint;
vec4 top, bottom, left, right;
float xPos, yPos;

int imgIndex;
float colorDiff;
float opositeColorDiff;

float sizeTextelX;
float sizeTextelY;

vec4 getColor(vec2 pos){

    if(textureIndex == 0)
        return texture2D(volume1, pos.xy);
    if(textureIndex == 1)
        return texture2D(volume2, pos.xy);
    if(textureIndex == 2)
        return texture2D(volume3, pos.xy);
    if(textureIndex == 3)
        return texture2D(volume4, pos.xy);

    return vec4(0.);
}

void mappingFceActual(vec3 position){
    imgIndex = int(floor(position.z * zCount));

    int yOffset = imgIndex / cntInRow;
    int xOffset = imgIndex - (yOffset * cntInRow);

    textureIndex = yOffset/cntInRow;
    yOffset -= textureIndex*cntInRow;

    xPos = (position.x / float(cntInRow)) + (partSide * float(xOffset));
    yPos = (position.y / float(cntInRow)) + (partSide * float(yOffset));

    actualPoint = getColor(vec2(xPos, yPos));
}

void mappingFceEviroment(vec3 position){
    right = getColor(vec2(xPos + sizeTextelX, yPos));
    left = getColor(vec2(xPos - sizeTextelX, yPos));
    top = getColor(vec2(xPos, yPos + sizeTextelY));
    bottom = getColor(vec2(xPos, yPos - sizeTextelY));
}

float getFilteredColor(float color1, float color2){

    //return color1;
    return color1*opositeColorDiff + color2*colorDiff;
}


vec3 getActualNormal(){
    vec3 normal = vec3( getFilteredColor(right.g, right.b) - getFilteredColor(left.g, left.b),
                        getFilteredColor(top.g, top.b) - getFilteredColor(bottom.g, bottom.b),
                        getFilteredColor(actualPoint.r, actualPoint.g) - getFilteredColor(actualPoint.b, actualPoint.a));
    return normalize(normal);
}

float getLightIntensity(vec3 actualPos, vec3 normal){
    //vec3 lightVec = normalize(lightPos - actualPos);
    //float diffuse = max(dot(lightVec, normal), 0.3);

    vec3 lightVec = normalize(lightPos - actualPos);
    float diffuse = clamp(dot(lightVec, normal), 0.2, 1.);

    //Aj odraz
    //vec3 viewVec = direction;
    //vec3 reflectVec = reflect(-lightVec, normal);
    //float spec = 0.0;
    //if (diffuse > 0.0){
    //spec = max(dot(reflectVec, viewVec), 0.2);
    //spec = pow(spec, 16.0);
    //}
    //return SpecularContribution*spec + DiffuseContribution*diffuse;

    return DiffuseContribution*diffuse;
}

void comupteColorDiff(vec3 actualPos){
    float zAxis = actualPos.z * zCount;
    int imgIndex = int(zAxis);

    colorDiff = zAxis - float(imgIndex);
    opositeColorDiff = 1. - colorDiff;
}

void main()
{
    zCount = float(1) / zSize;

    vec4 value;
    vec4 result = vec4(0.0);

    vec2 fragCoord = gl_FragCoord.xy/size;
    vec3 frontPos = texture2D(frontFace, fragCoord).rgb;
    vec3 backPos = texture2D(backFace, fragCoord).rgb;

    //Preskocenie oblasti ktore niesu v objeme
    if(backPos.x == 0. && backPos.y == 0. && backPos.z == 0.)
    return;

    vec3 path = backPos - frontPos;
    direction = normalize(path);

    sizeTextelX = texelSize;
    sizeTextelY = texelSize;

    vec3 actualPos = frontPos;

    partSide = float(1) / float(cntInRow);

    float rayDistance = length(path);
    float actualDistance = 0.;

    vec3 diff1 = direction * step;
    float vDiff1 = length(diff1);

    float LightIntensity = 1.0;

    for (int i=0; i < 20000; i++) {

        if(actualDistance > rayDistance || actualPos.x > 1.0 || actualPos.x < 0.0 || actualPos.y > 1.0 || actualPos.y < 0.0 || actualPos.z > 1.0 || actualPos.z < 0.0 )
            break;

        mappingFceActual(actualPos);
        comupteColorDiff(actualPos);

        actualIntensity = getFilteredColor(actualPoint.g, actualPoint.b);

        if(actualIntensity > 0.01){
            mappingFceEviroment(actualPos);
            LightIntensity = getLightIntensity(actualPos, getActualNormal());

            value = texture2D(transferFce, vec2(actualIntensity, 0.5));
            value.rgb = clamp(value.rgb *  LightIntensity + value.rgb * 0.05, 0., 1.);

            if(value.a < 0.9)
                value.a *= alphaMultiplier*125.;

            result.rgb = (1.0 - result.a) * value.rgb * value.a + result.rgb;
            result.a = (1.0 - result.a) * value.a + result.a;

            if(result.a >= 0.99)
            {
                result.a = 1.0;
                break;
            }
        }

        actualPos += diff1;
        actualDistance += vDiff1;
    }
    gl_FragColor = result;
}