export function printReceiptWindow(title, htmlContent) {
  const printWindow = window.open("", "_blank", "width=420,height=720");

  if (!printWindow) {
    alert("Popup blocked. Please allow popups for printing.");
    return;
  }

  printWindow.document.write(`
    <html>
      <head>
        <title>${title}</title>
        <style>
          @page {
            size: 80mm auto;
            margin: 0;
          }

          body {
            font-family: Arial, Helvetica, sans-serif;
            width: 72mm;
            margin: 0 auto;
            padding: 10px;
            color: #000;
            background: #fff;
            font-size: 12px;
          }

          h1, h2, h3, p {
            margin: 0;
            padding: 0;
          }

          h2 {
            font-size: 18px;
            font-weight: 900;
          }

          h3 {
            font-size: 13px;
            font-weight: 900;
            margin-bottom: 6px;
          }

          .center {
            text-align: center;
          }

          .muted {
            color: #444;
          }

          .small {
            font-size: 11px;
          }

          .tiny {
            font-size: 10px;
          }

          .bold {
            font-weight: 900;
          }

          .line {
            border-top: 1px dashed #000;
            margin: 9px 0;
          }

          .solid-line {
            border-top: 2px solid #000;
            margin: 9px 0;
          }

          .row {
            display: flex;
            justify-content: space-between;
            gap: 8px;
            margin: 4px 0;
          }

          .row span:first-child {
            flex: 1;
          }

          .right {
            text-align: right;
          }

          .total {
            font-size: 16px;
            font-weight: 900;
          }

          .box {
            border: 2px solid #000;
            padding: 6px;
            margin-top: 6px;
          }

          .status-paid {
            font-size: 14px;
            font-weight: 900;
            border: 2px solid #000;
            padding: 5px;
            text-align: center;
            margin-top: 8px;
          }

          button {
            margin-top: 12px;
            width: 100%;
            padding: 10px;
            font-weight: 900;
            cursor: pointer;
          }

          @media print {
            button {
              display: none;
            }

            body {
              padding: 0;
            }
          }
        </style>
      </head>

      <body>
        ${htmlContent}

        <div class="line"></div>
        <p class="center tiny">Powered by ZERA POS</p>

        <button onclick="window.print()">Print</button>
      </body>
    </html>
  `);

  printWindow.document.close();
}
