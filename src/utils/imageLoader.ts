const images = import.meta.glob('../../public/assets/images/*/*.png', { eager: true, import: 'default' }) as Record<string, string>;

export const loadImage = (imageName: string): string => {
  const imagePath = `${imageName}`;
  return images[imagePath] || '';
};
