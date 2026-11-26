import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'The Ichalle Collection',
    short_name: 'The Ichalle', // Nama yang tampil di bawah ikon layar utama HP
    description: 'Timeless Elegance, Effortlessly Worn.',
    start_url: '/',
    display: 'standalone',
    background_color: '#FAF6F0',
    theme_color: '#5C1A26',
    icons: [
      {
        src: '/icon.png',
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: '/apple-icon.png',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
  };
}