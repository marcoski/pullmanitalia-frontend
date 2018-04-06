export default class ColorSchemer{
    
    constructor(hexColor, steps = 5){
        this.steps = steps;
        this.hexColor = hexColor;
        this.init();
    }

    /** PUBLIC METHODS */

    setColor(hexColor){
        this.hexColor = hexColor;
        this.init();
    }

    lighter(plus){
        this.hsl[2] += plus;
        if(this.hsl[2] > 100){
            this.hsl[2] = 100;
        }
        this.rgb = this.hslToRgb();
    }

    darker(minus){
        this.hsl[2] -= minus;
        if(this.hsl[2] < 0){
            this.hsl[2] = 0;
        }

        this.rgb = this.hslToRgb();
    }

    addSaturation(plus){
        this.hsl[1] += plus;
        if(this.hsl[1] < 100){
            this.hsl[1] = 100;
        }

        this.rgb = this.hslToRgb();
    }

    subSaturation(minus){
        this.hsl[1] -= minus;
        if(this.hsl[1] < 0){
            this.hsl[1] = 0;
        }

        this.rgb = this.hslToRgb();
    }

    paletteScheme(hueAngle = 10){
        return this.getColorsWheel(hueAngle);
    }

    getRandomColor(hueAngle = 10){
        const colors = this.getColorsWheel(hueAngle);
        return colors[Math.floor(Math.random() * colors.length)];
    }

    getColor(hueAngle = 30){
        const colors = this.getColorsWheel(hueAngle);
        return colors[0];
    }

    getGradientH(step = 7){
        let steps = [];
        for(let i = 0; i < step; i++){
            let h = i * 60;
            let hsl = this.hsbToHsl([
                parseFloat(h / 360),
                parseFloat(this.hsl[1] / 100),
                parseFloat(this.hsl[2] / 100)
            ]);

            steps.push(hsl);
        }

        return steps;
    }

    getGradientS(step = 2){
        let steps = [];
        for(let i = 0; i < step; i++){
            let hsl = this.hsbToHsl([
                parseFloat(this.hsl[0] / 360),
                i,
                parseFloat(this.hsl[2] / 100)
            ]);
            steps.push(hsl);
        }

        return steps;
    }

    getGradientL(step = 2){
        let steps = [];
        for(let i = 0; i < step; i++){
            let hsl = this.hsbToHsl([
                parseFloat(this.hsl[0] / 360),
                parseFloat(this.hsl[1] / 100),
                i
            ]);

            steps.push(hsl);
        }

        return steps;
    }

    rgbToHsl(rgb = []){
        if(rgb.length === 0){
            rgb = this.rgb;
        }

        let hsl = [];
        let min = 0;
        let max = 0;
        let red = (rgb[0] / 51) * 0.2;
        let green = (rgb[1] / 51) * 0.2;
        let blue = (rgb[2] / 51) * 0.2;

        max = Math.max(red, green, blue);
        min = Math.min(red, green, blue);

        let doubleL = (max + min);
        hsl[2] = doubleL/2;

        if(min === max){
            hsl[1] = 0;
            hsl[0] = 0;
        } else {
            if(hsl[2] < 0.5){
                hsl[1] = (max - min) / doubleL;
            } else if (hsl[2] >= 0.5){
                hsl[1] = (max - min) / (2.0 - doubleL);
            }

            if(red === max){
                hsl[0] = (green - blue) / (max - min);
            }else if(green === max){
                hsl[0] = 2.0 + (red - blue) / (max - min);
            }else if(blue === max){
                hsl[0] = 4.0 + (red - blue) / (max - min);
            }
        }

        /* converts value in degrees value */
        hsl[0] = Math.round(hsl[0] * 60.0);
        if(hsl[0] < 0){
            hsl[0] += 360;
        }

        if(hsl[0] >= 360){
            hsl[0] -= 360;
        }
        /* converts lightness and saturation in percentage values */
        hsl[1] = Math.round(hsl[1] * 100);
        hsl[2] = Math.round(hsl[2] * 100);

        return hsl;
    }

    hslToRgb(hsl = []){
        if(hsl.length === 0){
            hsl = this.hsl;
        }

        let rgb = [];
        let hue = hsl[0];
        let saturation = hsl[1];
        let lightness = hsl[2];

        if(saturation === 0){
            rgb[0] = rgb[1] = rgb[2] = lightness;
        }else{
            let p, q;
            if(lightness < 0.5){
                q = lightness * (1.0 + saturation);
            }else if(lightness >= 0.5){
                q = lightness + saturation - (lightness * saturation);
            }

            p = 2.0 * lightness - q;

            rgb[0] = Math.abs(Math.round(this.findRgbColor(p, q, hue + 120) % 255));
            rgb[1] = Math.abs(Math.round(this.findRgbColor(p, q, hue) % 255));
            rgb[2] = Math.abs(Math.round(this.findRgbColor(p, q, hue - 120) % 255));
        }

        return rgb;
    }

    /** PRIVATE METHODS */
    init(){
        this.rgb = this.hexToRgb();
        this.hsl = this.rgbToHsl();
    }

    getColorsWheel(hueAngle){
        let colors = [];
        for(let i = 0; i < this.steps; i++){
            this.rgb = this.hslToRgb();
            this.hsl = this.rgbToHsl();
            colors.push(this.rgbToHex());
            this.hsl[0] = (this.hsl[0] + hueAngle) % 360;
        }

        return colors;
    }

    findRgbColor(p, q, hue){
        if(hue > 360){
            hue -= 360;
        }
        
        if(hue < 0){
            hue += 360;
        }

        if(hue < 60){
            return (p + (q - p) * hue / 60);
        }else if(hue < 180){
            return q;
        }else if(hue < 240){
            return (p + (q - p) * (240 - hue) / 60);
        }else{
            return p;
        }

    }

    hexToRgb(){
        let intColor = parseInt(this.hexColor, 16);
        return [
            0xFF & (intColor >> 0x10),
            0xFF & (intColor >> 0x8),
            0xFF & intColor
        ];
    }

    rgbToHex(rgb = []){
        if(rgb.length === 0){
            rgb = this.rgb;
        }

        rgb[0] = (rgb[0] < 0 ? 0 : (rgb[0] > 255 ? 255 : rgb[0])).toString(16);
        rgb[1] = (rgb[1] < 0 ? 0 : (rgb[1] > 255 ? 255 : rgb[1])).toString(16);
        rgb[2] = (rgb[2] < 0 ? 0 : (rgb[2] > 255 ? 255 : rgb[2])).toString(16);

        let color = (rgb[0].length < 2 ? '0' : '') + rgb[0];
        color += (rgb[1].length < 2 ? '0' : '') + rgb[1];
        color += (rgb[2].length < 2 ? '0' : '') + rgb[2];

        return color;
    }

    hsbToHsl(hsb = []){
        let hsl = [];
        hsl[0] = hsb[0];
        hsl[1] = (2 - hsb[1]) * hsb[2];
        hsl[2] = hsb[1] * hsb[2];

        if(hsl[2] <= 1 && hsl[2] > 0){
            hsl[1] /= hsl[2];
        } else {
            hsl[1] /= 2 - hsl[2];
        }

        hsl[2] /= 2;

        if(hsl[1] > 1){
            hsl[1] = 1;
        }

        if(!hsl[1] > 0){
            hsl[1] = 0;
        }

        hsl[0] *= 360;
        hsl[1] *= 100;
        hsl[2] *= 100;

        return hsl;
    }
}