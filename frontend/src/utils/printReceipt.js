export function printReceiptWindow(title, htmlContent) {
  const printWindow = window.open("", "_blank", "width=420,height=700");

  if (!printWindow) {
    alert("Popup blocked. Please allow popups for printing.");
    return;
  }

  printWindow.document.write(`
      <html>
        <head>
          <title>${title}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              width: 280px;
              margin: 0 auto;
              padding: 12px;
              color: #000;
            }
  
            h1, h2, h3, p {
              margin: 0;
              padding: 0;
            }
  
            .center {
              text-align: center;
            }
  
            .line {
              border-top: 1px dashed #000;
              margin: 10px 0;
            }
  
            .row {
              display: flex;
              justify-content: space-between;
              gap: 8px;
              font-size: 13px;
              margin: 4px 0;
            }
  
            .small {
              font-size: 12px;
            }
  
            .bold {
              font-weight: bold;
            }
  
            .total {
              font-size: 16px;
              font-weight: bold;
            }
  
            @media print {
              button {
                display: none;
              }
            }
          </style>
        </head>
  
        <body>
          ${htmlContent}
  
          <div class="line"></div>
          <button onclick="window.print()">Print</button>
        </body>
      </html>
    `);

  printWindow.document.close();
}
