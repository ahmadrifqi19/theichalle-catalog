/**
 * Formats a numeric price into standard Indonesian Rupiah format (e.g., Rp 349.000)
 */
export function formatRupiah(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return 'Rp 0';
  }
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount).replace('IDR', 'Rp');
}

/**
 * Builds the pre-filled WhatsApp message URL according to the brand specifications
 */
export function buildWhatsAppOrderUrl(params: {
  phone: string;
  productName: string;
  shade?: string;
  size?: string;
}): string {
  const cleanPhone = params.phone.replace(/[^0-9]/g, '');
  const formattedPhone = cleanPhone.startsWith('0')
    ? '62' + cleanPhone.slice(1)
    : cleanPhone.startsWith('62')
    ? cleanPhone
    : '62' + cleanPhone;

  const shadeText = params.shade || 'Not Specified';
  const sizeText = params.size || 'Standard';

  const message = `Hello The Ichalle Admin, I would like to order:\n- Item: ${params.productName}\n- Shade: ${shadeText}\n- Size: ${sizeText}\nIs this item still available?`;

  return `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;
}

/**
 * Builds standard WhatsApp consultation link
 */
export function buildWhatsAppConsultationUrl(phone: string): string {
  const cleanPhone = phone.replace(/[^0-9]/g, '');
  const formattedPhone = cleanPhone.startsWith('0')
    ? '62' + cleanPhone.slice(1)
    : cleanPhone.startsWith('62')
    ? cleanPhone
    : '62' + cleanPhone;

  const message = "Hello The Ichalle Concierge, I would like to inquire about the latest collection.";
  return `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;
}

