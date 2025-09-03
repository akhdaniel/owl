^XA               // Start of label format
^PW640              // Set label width (80mm = 640 dots at 203 DPI)
^LL400              // Set label height (50mm = 400 dots at 203 DPI)
^LH0,0             // Set label origin

// Product Name (3 lines)
^FO20,20
^A0,40,40
^FB600,3,0,C
^FDProduct Name Here
^FS

// Lot Name (Single Line)
^FO20,140
^A0,30,30
^FDLot: LOT123456
^FS

// Barcode (Lot Name)
^FO50,200
^BY3,2,100
^BCN,100,Y,N,N
^FDLOT123456
^FS

^XZ    // End of label format
