import { Capacitor } from '@capacitor/core'
import { Filesystem, Directory } from '@capacitor/filesystem'
import { Share } from '@capacitor/share'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

export async function printOrExportPdf(elementId, fileName = 'laporan') {
  // Kalau di browser, tetap pakai print biasa
  if (!Capacitor.isNativePlatform()) {
    window.print()
    return
  }

  try {
    const areaPrint = document.getElementById(elementId)

    if (!areaPrint) {
      alert('Area print tidak ditemukan.')
      return
    }

    const canvas = await html2canvas(areaPrint, {
      scale: 2,
      useCORS: true
    })

    const imgData = canvas.toDataURL('image/png')

    const pdf = new jsPDF('p', 'mm', 'a4')
    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()

    const imgWidth = pageWidth
    const imgHeight = (canvas.height * imgWidth) / canvas.width

    let heightLeft = imgHeight
    let position = 0

    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
    heightLeft -= pageHeight

    while (heightLeft > 0) {
      position = heightLeft - imgHeight
      pdf.addPage()
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight
    }

    const base64Pdf = pdf.output('datauristring').split(',')[1]
    const pdfName = `${fileName}-${Date.now()}.pdf`

    await Filesystem.writeFile({
      path: pdfName,
      data: base64Pdf,
      directory: Directory.Cache
    })

    const fileUri = await Filesystem.getUri({
      path: pdfName,
      directory: Directory.Cache
    })

    await Share.share({
      title: fileName,
      text: 'File laporan',
      files: [fileUri.uri],
      dialogTitle: 'Bagikan / Cetak Laporan'
    })
  } catch (error) {
    console.error('Gagal membuat PDF:', error)
    alert('Gagal membuat PDF.')
  }
}
