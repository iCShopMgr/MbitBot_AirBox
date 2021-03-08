enum soft_serial {
    //% block="P0"
    pms_serial_0 = 0,
    //% block="P1"
    pms_serial_1 = 1,
    //% block="P2"
    pms_serial_2 = 2,
    //% block="P8"
    pms_serial_8 = 3,
    //% block="P13"
    pms_serial_13 = 4,
    //% block="P14"
    pms_serial_14 = 5,
    //% block="P15"
    pms_serial_15 = 6,
    //% block="P16"
    pms_serial_16 = 7
}

enum PMS5003_data {
    //% block="PM1.0"
    data_1 = 1,
    //% block="PM2.5"
    data_2 = 2,
    //% block="PM10"
    data_3 = 3
}

enum DHTState {
    //% block="Temp"
    temp = 1,
    //% block="Humid"
    humid = 2
}

let buf = pins.createBuffer(2)
let read1, read2, read3
let pms_serial_list = [SerialPin.P0, SerialPin.P1, SerialPin.P2, SerialPin.P8, SerialPin.P13, SerialPin.P14, SerialPin.P15, SerialPin.P16]
let pms_digital_list = [DigitalPin.P0, DigitalPin.P1, DigitalPin.P2, DigitalPin.P8, DigitalPin.P13, DigitalPin.P14, DigitalPin.P15, DigitalPin.P16]
let pmat10 = 0
let pmat25 = 0
let pmat100 = 0

function PMS5003(choose1: number, choose2: number): void {
    serial.redirect(pms_serial_list[choose1], pms_serial_list[choose2] ,BaudRate.BaudRate9600);
    basic.pause(300);
	pins.digitalWritePin(pms_digital_list[choose2], 1);
    let check = -1;
    let Head;

	while (check == -1) {
        Head = serial.readBuffer(20)
        let count = 0;
        while (true) {
            if (Head.getNumber(NumberFormat.Int8LE, count) == 0x42 && Head.getNumber(NumberFormat.Int8LE, count+1) == 0x4d) {
                check = count;
            }
            else if (count > 3) {
                break;
            }
            count += 1
        }
    }

    pmat10 = 256*Head.getNumber(NumberFormat.Int8LE, check+10) + Head.getNumber(NumberFormat.Int8LE, check+11);
    pmat25 = 256*Head.getNumber(NumberFormat.Int8LE, check+12) + Head.getNumber(NumberFormat.Int8LE, check+13);
    pmat100 = 256*Head.getNumber(NumberFormat.Int8LE, check+14) + Head.getNumber(NumberFormat.Int8LE, check+15);

}

function PMS5003_getData(choose: number) : number{
    if (choose == 1) {
        return pmat10;
    }
    else if (choose == 2) {
        return pmat25;
    }
    else {
        return pmat100;
    }
}

let DHT_count = 0;
let DHT_value = 0;
let DHT_out = 0;
let DHT_Temp = 0;
let DHT_Humid = 0;
let DHTpin = DigitalPin.P1;

function Ready(): number {
    pins.digitalWritePin(DHTpin, 0);
    basic.pause(20);
    pins.digitalWritePin(DHTpin, 1);
    DHT_count = input.runningTimeMicros();
    while (pins.digitalReadPin(DHTpin) == 1) {
        if (input.runningTimeMicros() - DHT_count > 100) {
            return 0;
        }
    }
    DHT_count = input.runningTimeMicros();
    while (pins.digitalReadPin(DHTpin) == 0) {
        if (input.runningTimeMicros() - DHT_count > 100) {
            return 0;
        }
    }
    DHT_count = input.runningTimeMicros();
    while (pins.digitalReadPin(DHTpin) == 1) {
        if (input.runningTimeMicros() - DHT_count > 100) {
            return 0;
        }
    }
    return 1;
}

function ReadData() {
    DHT_value = 0;
    if (Ready() == 1) {
        for (let k = 0; k < 24; k++) {
            DHT_out = 0;
            while (pins.digitalReadPin(DHTpin) == 0) {
                DHT_out += 1;
                if (DHT_out > 100) {
                    break;
                }
            }
            DHT_count = input.runningTimeMicros();
            DHT_out = 0;
            while (pins.digitalReadPin(DHTpin) == 1) {
                DHT_out += 1;
                if (DHT_out > 100) {
                    break;
                }
            }
            if (input.runningTimeMicros() - DHT_count > 40) {
                DHT_value = DHT_value + (1 << (23 - k));
                DHT_Temp = (DHT_value & 0x0000ffff);
                DHT_Humid = (DHT_value >> 16);
            }
        }
    }
    else {
        pins.digitalWritePin(DHTpin, 1);
    }
}


enum OLED_Size {
    //% block="Big"
    size1 = 1,
    //% block="Small"
    size2 = 0
}

let font: number[] = [];
font[0] = 0x0022d422; font[1] = 0x0022d422; font[2] = 0x0022d422; font[3] = 0x0022d422;
font[4] = 0x0022d422; font[5] = 0x0022d422; font[6] = 0x0022d422; font[7] = 0x0022d422;
font[8] = 0x0022d422; font[9] = 0x0022d422; font[10] = 0x0022d422; font[11] = 0x0022d422;
font[12] = 0x0022d422; font[13] = 0x0022d422; font[14] = 0x0022d422; font[15] = 0x0022d422;
font[16] = 0x0022d422; font[17] = 0x0022d422; font[18] = 0x0022d422; font[19] = 0x0022d422;
font[20] = 0x0022d422; font[21] = 0x0022d422; font[22] = 0x0022d422; font[23] = 0x0022d422;
font[24] = 0x0022d422; font[25] = 0x0022d422; font[26] = 0x0022d422; font[27] = 0x0022d422;
font[28] = 0x0022d422; font[29] = 0x0022d422; font[30] = 0x0022d422; font[31] = 0x0022d422;
font[32] = 0x00000000; font[33] = 0x000002e0; font[34] = 0x00018060; font[35] = 0x00afabea;
font[36] = 0x00aed6ea; font[37] = 0x01991133; font[38] = 0x010556aa; font[39] = 0x00000060;
font[40] = 0x000045c0; font[41] = 0x00003a20; font[42] = 0x00051140; font[43] = 0x00023880;
font[44] = 0x00002200; font[45] = 0x00021080; font[46] = 0x00000100; font[47] = 0x00111110;
font[48] = 0x0007462e; font[49] = 0x00087e40; font[50] = 0x000956b9; font[51] = 0x0005d629;
font[52] = 0x008fa54c; font[53] = 0x009ad6b7; font[54] = 0x008ada88; font[55] = 0x00119531;
font[56] = 0x00aad6aa; font[57] = 0x0022b6a2; font[58] = 0x00000140; font[59] = 0x00002a00;
font[60] = 0x0008a880; font[61] = 0x00052940; font[62] = 0x00022a20; font[63] = 0x0022d422;
font[64] = 0x00e4d62e; font[65] = 0x000f14be; font[66] = 0x000556bf; font[67] = 0x0008c62e;
font[68] = 0x0007463f; font[69] = 0x0008d6bf; font[70] = 0x000094bf; font[71] = 0x00cac62e;
font[72] = 0x000f909f; font[73] = 0x000047f1; font[74] = 0x0017c629; font[75] = 0x0008a89f;
font[76] = 0x0008421f; font[77] = 0x01f1105f; font[78] = 0x01f4105f; font[79] = 0x0007462e;
font[80] = 0x000114bf; font[81] = 0x000b6526; font[82] = 0x010514bf; font[83] = 0x0004d6b2;
font[84] = 0x0010fc21; font[85] = 0x0007c20f; font[86] = 0x00744107; font[87] = 0x01f4111f;
font[88] = 0x000d909b; font[89] = 0x00117041; font[90] = 0x0008ceb9; font[91] = 0x0008c7e0;
font[92] = 0x01041041; font[93] = 0x000fc620; font[94] = 0x00010440; font[95] = 0x01084210;
font[96] = 0x00000820; font[97] = 0x010f4a4c; font[98] = 0x0004529f; font[99] = 0x00094a4c;
font[100] = 0x000fd288; font[101] = 0x000956ae; font[102] = 0x000097c4; font[103] = 0x0007d6a2;
font[104] = 0x000c109f; font[105] = 0x000003a0; font[106] = 0x0006c200; font[107] = 0x0008289f;
font[108] = 0x000841e0; font[109] = 0x01e1105e; font[110] = 0x000e085e; font[111] = 0x00064a4c;
font[112] = 0x0002295e; font[113] = 0x000f2944; font[114] = 0x0001085c; font[115] = 0x00012a90;
font[116] = 0x010a51e0; font[117] = 0x010f420e; font[118] = 0x00644106; font[119] = 0x01e8221e;
font[120] = 0x00093192; font[121] = 0x00222292; font[122] = 0x00095b52; font[123] = 0x0008fc80;
font[124] = 0x000003e0; font[125] = 0x000013f1; font[126] = 0x00841080; font[127] = 0x0022d422;

let _screen = pins.createBuffer(1025);
let _buf2 = pins.createBuffer(2);
let _buf3 = pins.createBuffer(3);
let _buf4 = pins.createBuffer(4);
let fontsize = 1;

function cmd1(d: number) {
    let n = d % 256;
    pins.i2cWriteNumber(60, n, NumberFormat.UInt16BE);
}

function cmd2(d1: number, d2: number) {
    _buf3[0] = 0;
    _buf3[1] = d1;
    _buf3[2] = d2;
    pins.i2cWriteBuffer(60, _buf3);
}

function cmd3(d1: number, d2: number, d3: number) {
    _buf4[0] = 0;
    _buf4[1] = d1;
    _buf4[2] = d2;
    _buf4[3] = d3;
    pins.i2cWriteBuffer(60, _buf4);
}

function set_pos(col: number = 0, page: number = 0) {
    cmd1(0xb0 | page) // page number
    let c = col * (fontsize + 1)
    cmd1(0x00 | (c % 16)) // lower start column address
    cmd1(0x10 | (c >> 4)) // upper start column address
}

function draw() {
    set_pos()
    pins.i2cWriteBuffer(60, _screen)
}

/*
 * MbitBot AirBox
 */
//% weight=0 color=#fa304f icon="\uf185" block="MbitBot AirBox"
namespace mbitbot_airbox {
	  //% blockId="get_pms3003" block="PMS3003 connect RX %choose1 TX %choose2 read data"
    //% weight=10
    export function get_pms3003(choose1: soft_serial, choose2: soft_serial): void {
        return PMS5003(choose1, choose2);
    }

	  //% blockId="data_pms3003" block="Get PMS3003 %choose data"
    //% weight=9
    export function data_pms3003(choose: PMS5003_data): number {
        return PMS5003_getData(choose);
    }

    //% blockId=dht11 block="DHT11 %p read %s"
    //% weight=8
    export function dht11(p: DigitalPin, s: DHTState): number {
        DHTpin = p;
        ReadData()
        if (s == 1) {
            return DHT_Temp;
        }
        else {
            return DHT_Humid;
        }
    }

	  //% weight=8
    //% blockId="OLED_init" block="OLED init"
    export function oled_init() {
        cmd1(0xAE)         // SSD1306_DISPLAYOFF
        cmd1(0xA4)         // SSD1306_DISPLAYALLON_RESUME
        cmd2(0xD5, 0xF0)   // SSD1306_SETDISPLAYCLOCKDIV
        cmd2(0xA8, 0x3F)   // SSD1306_SETMULTIPLEX
        cmd2(0xD3, 0x00)   // SSD1306_SETDISPLAYOFFSET
        cmd1(0 | 0x0)      // line #SSD1306_SETSTARTLINE
        cmd2(0x8D, 0x14)   // SSD1306_CHARGEPUMP
        cmd2(0x20, 0x00)   // SSD1306_MEMORYMODE
        cmd3(0x21, 0, 127) // SSD1306_COLUMNADDR
        cmd3(0x22, 0, 63)  // SSD1306_PAGEADDR
        cmd1(0xa0 | 0x1)   // SSD1306_SEGREMAP
        cmd1(0xc8)         // SSD1306_COMSCANDEC
        cmd2(0xDA, 0x12)   // SSD1306_SETCOMPINS
        cmd2(0x81, 0xCF)   // SSD1306_SETCONTRAST
        cmd2(0xd9, 0xF1)   // SSD1306_SETPRECHARGE
        cmd2(0xDB, 0x40)   // SSD1306_SETVCOMDETECT
        cmd1(0xA6)         // SSD1306_NORMALDISPLAY
        cmd2(0xD6, 1)      // zoom on
        cmd1(0xAF)         // SSD1306_DISPLAYON
        oled_clear()
        fontsize = 1
    }

	//% weight=7
    //% blockId="OLED_show_string" block="OLED show string at x: %x |y: %y|text: %s"
    export function oled_showString(x: number, y: number, s: string) {
        let col = 0
        let p = 0
        let ind = 0
        for (let n = 0; n < s.length; n++) {
            p = font[s.charCodeAt(n)]
            for (let i = 0; i < 5; i++) {
                col = 0
                for (let j = 0; j < 5; j++) {
                    if (p & (1 << (5 * i + j)))
                        col |= (1 << (j + 1))
                }
                ind = (x + n) * 5 * (fontsize + 1) + y * 128 + i * (fontsize + 1) + 1
                _screen[ind] = col
                if (fontsize)_screen[ind + 1] = col
            }
        }
        set_pos(x * 5, y)
        let ind0 = x * 5 * (fontsize + 1) + y * 128
        let buf = _screen.slice(ind0, ind + 1)
        buf[0] = 0x40
        pins.i2cWriteBuffer(60, buf)
    }

	//% weight=7
    //% blockId="OLED_show_number" block="OLED show a Number at x: %x |y: %y|number: %num"
    export function oled_showNumber(x: number, y: number, num: number) {
        oled_showString(x, y, num.toString())
    }



	//% weight=7
    //% blockId="OLED_font_size" block="OLED font size %oled_size"
    export function oled_font_size(oled_size: OLED_Size) {
        fontsize = (oled_size) ? 1 : 0
        cmd2(0xd6, fontsize)
    }

	//% weight=7
    //% blockId="OLED_clera" block="OLED clear"
    export function oled_clear() {
        _screen.fill(0)
        _screen[0] = 0x40
        draw()
    }

}
