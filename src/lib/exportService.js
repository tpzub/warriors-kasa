import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { saveAs } from 'file-saver';
import { format } from 'date-fns';

// Funkce pro získání aktuálního data a času pro název souboru
const getTimestamp = () => {
  return format(new Date(), 'yyyy-MM-dd_HH-mm');
};

// Funkce pro normalizaci českých znaků v PDF
const normalizeCzechText = (text) => {
  if (!text) return text;
  return text
    .replace(/č/g, 'c').replace(/Č/g, 'C')
    .replace(/ř/g, 'r').replace(/Ř/g, 'R')
    .replace(/š/g, 's').replace(/Š/g, 'S')
    .replace(/ž/g, 'z').replace(/Ž/g, 'Z')
    .replace(/ý/g, 'y').replace(/Ý/g, 'Y')
    .replace(/á/g, 'a').replace(/Á/g, 'A')
    .replace(/é/g, 'e').replace(/É/g, 'E')
    .replace(/ě/g, 'e').replace(/Ě/g, 'E')
    .replace(/í/g, 'i').replace(/Í/g, 'I')
    .replace(/ó/g, 'o').replace(/Ó/g, 'O')
    .replace(/ú/g, 'u').replace(/Ú/g, 'U')
    .replace(/ů/g, 'u').replace(/Ů/g, 'U')
    .replace(/ď/g, 'd').replace(/Ď/g, 'D')
    .replace(/ň/g, 'n').replace(/Ň/g, 'N')
    .replace(/ť/g, 't').replace(/Ť/g, 'T')
    // Oprava problematických znaků
    .replace(/'/g, "'") // různé typy apostrofů
    .replace(/'/g, "'")
    .replace(/"/g, '"') // různé typy uvozovek
    .replace(/"/g, '"')
    .replace(/–/g, '-') // en dash
    .replace(/—/g, '-') // em dash
    .replace(/…/g, '...'); // trojtecka
};

// Funkce pro kreslení jednoduchého sloupcového grafu
const drawSimpleBarChart = (doc, x, y, width, height, data) => {
  const maxValue = Math.max(...data.map(item => item.value));
  const barWidth = width / data.length;
  const colors = [
    [52, 152, 219],  // modra
    [46, 204, 113],  // zelena
    [231, 76, 60]    // cervena
  ];
  
  // Nakresli osu
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.5);
  doc.line(x, y + height, x + width, y + height); // X osa
  doc.line(x, y, x, y + height); // Y osa
  
  // Nakresli sloupce
  data.forEach((item, index) => {
    const barHeight = (item.value / maxValue) * height * 0.8; // 80% vysky pro mezeru
    const barX = x + (index * barWidth) + (barWidth * 0.1); // 10% okraj
    const barY = y + height - barHeight;
    const actualBarWidth = barWidth * 0.8; // 80% sirky sloupce
    
    // Sloupec
    doc.setFillColor(...colors[index % colors.length]);
    doc.rect(barX, barY, actualBarWidth, barHeight, 'F');
    
    // Hodnota nad sloupcem
    doc.setFontSize(8);
    doc.setTextColor(0, 0, 0);
    const valueText = item.value.toLocaleString('cs-CZ');
    doc.text(valueText, barX + (actualBarWidth / 2), barY - 5, { align: 'center' });
    
    // Popis pod sloupcem
    doc.setFontSize(7);
    const labelText = normalizeCzechText(item.label);
    doc.text(labelText, barX + (actualBarWidth / 2), y + height + 10, { align: 'center' });
  });
};

// Export do JSON
export const exportToJSON = (hraci, pokuty) => {
  const data = {
    exportDate: new Date().toISOString(),
    season: `Sezóna ${new Date().getFullYear()}`,
    summary: {
      totalPlayers: hraci.length,
      totalPenaltyTypes: pokuty.length,
      totalDebt: hraci.reduce((sum, h) => sum + h.dluhCelkem, 0),
      totalPaid: hraci.reduce((sum, h) => sum + (h.zaplatil || 0), 0),
      totalRemaining: hraci.reduce((sum, h) => sum + (h.dluhCelkem - (h.zaplatil || 0)), 0)
    },
    players: hraci.map(hrac => ({
      id: hrac.id,
      name: hrac.jmeno,
      totalDebt: hrac.dluhCelkem,
      totalPaid: hrac.zaplatil || 0,
      remaining: hrac.dluhCelkem - (hrac.zaplatil || 0),
      penalties: hrac.pokuty || [],
      penaltiesCount: (hrac.pokuty || []).length
    })),
    penaltyTypes: pokuty.map(pokuta => ({
      id: pokuta.id,
      name: pokuta.nazev,
      amount: pokuta.castka
    }))
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  saveAs(blob, `kasa-export_${getTimestamp()}.json`);
};

// Export do CSV
export const exportToCSV = (hraci, pokuty) => {
  // Hlavička CSV
  let csv = '\ufeff'; // BOM pro správné zobrazení češtiny v Excelu
  csv += 'Jméno hráče;Celkový dluh (Kč);Zaplaceno (Kč);Zbývá (Kč);Počet pokut;Detail pokut\n';
  
  // Data hráčů
  hraci.forEach(hrac => {
    const penaltiesDetail = (hrac.pokuty || [])
      .map(p => `${p.nazev} (${p.castka} Kč)`)
      .join(', ');
    
    csv += `${hrac.jmeno};`;
    csv += `${hrac.dluhCelkem};`;
    csv += `${hrac.zaplatil || 0};`;
    csv += `${hrac.dluhCelkem - (hrac.zaplatil || 0)};`;
    csv += `${(hrac.pokuty || []).length};`;
    csv += `"${penaltiesDetail}"\n`;
  });
  
  // Souhrn
  csv += '\n\nSOUHRN\n';
  csv += `Celkem hráčů;${hraci.length}\n`;
  csv += `Celkový dluh;${hraci.reduce((sum, h) => sum + h.dluhCelkem, 0)} Kč\n`;
  csv += `Celkem zaplaceno;${hraci.reduce((sum, h) => sum + (h.zaplatil || 0), 0)} Kč\n`;
  csv += `Zbývá zaplatit;${hraci.reduce((sum, h) => sum + (h.dluhCelkem - (h.zaplatil || 0)), 0)} Kč\n`;
  
  // Seznam typů pokut
  csv += '\n\nTYPY POKUT\n';
  csv += 'Název;Částka (Kč)\n';
  pokuty.forEach(pokuta => {
    csv += `${pokuta.nazev};${pokuta.castka}\n`;
  });

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  saveAs(blob, `kasa-export_${getTimestamp()}.csv`);
};

// Export do PDF
export const exportToPDF = (hraci, pokuty) => {
  const doc = new jsPDF();
  
  // Nastavení fontů pro češtinu - použijeme font s lepší Unicode podporou
  doc.setFont('helvetica');
  doc.setLanguage('cs-CZ');
  
  // Nadpis
  doc.setFontSize(20);
  doc.text(normalizeCzechText('Export dat - Warriors Kasa'), 14, 20);
  
  // Datum exportu
  doc.setFontSize(10);
  doc.text(normalizeCzechText(`Datum exportu: ${format(new Date(), 'dd.MM.yyyy HH:mm')}`), 14, 30);
  
  // Souhrn
  doc.setFontSize(14);
  doc.text(normalizeCzechText('Souhrn'), 14, 45);
  doc.setFontSize(10);
  
  const totalDebt = hraci.reduce((sum, h) => sum + h.dluhCelkem, 0);
  const totalPaid = hraci.reduce((sum, h) => sum + (h.zaplatil || 0), 0);
  const totalRemaining = totalDebt - totalPaid;
  
  // Počet hráčů s ikonou
  doc.setFontSize(12);
  doc.text('♦', 14, 55); // symbol pro hráče
  doc.setFontSize(10);
  doc.text(normalizeCzechText(`Celkem hracu: ${hraci.length}`), 22, 55);
  
  // Data pro graf
  const chartData = [
    { label: 'Celkovy dluh', value: totalDebt },
    { label: 'Zaplaceno', value: totalPaid },
    { label: 'Zbyva zaplatit', value: totalRemaining }
  ];
  
  // Nakresli graf
  drawSimpleBarChart(doc, 14, 65, 120, 40, chartData);
  
  // Textový souhrn pod grafem
  doc.setFontSize(8);
  doc.text(normalizeCzechText(`Celkovy dluh: ${totalDebt.toLocaleString('cs-CZ')} Kc`), 14, 120);
  doc.text(normalizeCzechText(`Zaplaceno: ${totalPaid.toLocaleString('cs-CZ')} Kc`), 14, 127);
  doc.text(normalizeCzechText(`Zbyva: ${totalRemaining.toLocaleString('cs-CZ')} Kc`), 14, 134);
  
  // Tabulka hráčů
  doc.setFontSize(14);
  doc.text(normalizeCzechText('Prehled hracu'), 14, 150);
  
  const playersData = hraci.map((hrac, index) => [
    index + 1,
    normalizeCzechText(hrac.jmeno),
    normalizeCzechText(`${hrac.dluhCelkem} Kc`),
    normalizeCzechText(`${hrac.zaplatil || 0} Kc`),
    normalizeCzechText(`${hrac.dluhCelkem - (hrac.zaplatil || 0)} Kc`),
    (hrac.pokuty || []).length
  ]);
  
  autoTable(doc, {
    startY: 155,
    head: [[
      '#', 
      normalizeCzechText('Jmeno'), 
      normalizeCzechText('Dluh'), 
      normalizeCzechText('Zaplaceno'), 
      normalizeCzechText('Zbyva'), 
      normalizeCzechText('Pocet pokut')
    ]],
    body: playersData,
    styles: { fontSize: 9 },
    headStyles: { fillColor: [41, 128, 185] }
  });
  
  // Typy pokut na nové stránce
  doc.addPage();
  doc.setFontSize(14);
  doc.text(normalizeCzechText('Typy pokut'), 14, 20);
  
  const penaltiesData = pokuty.map((pokuta, index) => [
    index + 1,
    normalizeCzechText(pokuta.nazev),
    normalizeCzechText(`${pokuta.castka} Kc`)
  ]);
  
  autoTable(doc, {
    startY: 25,
    head: [[
      '#', 
      normalizeCzechText('Nazev pokuty'), 
      normalizeCzechText('Castka')
    ]],
    body: penaltiesData,
    styles: { fontSize: 9 },
    headStyles: { fillColor: [41, 128, 185] }
  });
  
  // Detail pokut hráčů
  let currentY = doc.lastAutoTable.finalY + 20;
  
  if (currentY > 250) {
    doc.addPage();
    currentY = 20;
  }
  
  doc.setFontSize(14);
  doc.text(normalizeCzechText('Detail pokut hracu'), 14, currentY);
  currentY += 10;
  
  hraci.forEach(hrac => {
    if ((hrac.pokuty || []).length > 0) {
      if (currentY > 250) {
        doc.addPage();
        currentY = 20;
      }
      
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text(normalizeCzechText(hrac.jmeno), 14, currentY);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      currentY += 5;
      
      (hrac.pokuty || []).forEach(pokuta => {
        if (currentY > 280) {
          doc.addPage();
          currentY = 20;
        }
        doc.text(normalizeCzechText(`• ${pokuta.nazev}: ${pokuta.castka} Kc`), 20, currentY);
        currentY += 5;
      });
      
      currentY += 5;
    }
  });
  
  doc.save(`kasa-export_${getTimestamp()}.pdf`);
};

// Funkce pro reset dat hráčů
export const resetPlayersPenalties = async (firestore, collection, doc, updateDoc) => {
  try {
    // Načteme všechny hráče
    const hraciCollection = await collection(firestore, 'hraci');
    const snapshot = await hraciCollection.getDocs();
    
    // Pro každého hráče vyresetujeme pokuty
    const updatePromises = snapshot.docs.map(hracDoc => {
      const hracRef = doc(firestore, 'hraci', hracDoc.id);
      return updateDoc(hracRef, {
        pokuty: [],
        dluhCelkem: 0,
        zaplatil: 0
      });
    });
    
    // Počkáme na dokončení všech updatů
    await Promise.all(updatePromises);
    
    return { success: true, playersReset: snapshot.docs.length };
  } catch (error) {
    console.error('Chyba při resetování dat:', error);
    return { success: false, error: error.message };
  }
};