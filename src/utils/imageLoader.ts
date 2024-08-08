const images = import.meta.glob('../assets/images/backtesting/*.png', { eager: true, import: 'default' }) as Record<string, string>;

export const loadImage = (imageName: string): string => {
  const imagePath = `../assets/images/backtesting/${imageName}`;
  return images[imagePath] || '';
};