// Avatar images for user profiles
// Male and Female avatars from assets folder

export const maleAvatars = [
  require('../../assets/Male/1.png'),
  require('../../assets/Male/2.png'),
  require('../../assets/Male/3.png'),
  require('../../assets/Male/4.png'),
  require('../../assets/Male/5.png'),
  require('../../assets/Male/6.png'),
  require('../../assets/Male/7.png'),
  require('../../assets/Male/8.png'),
  require('../../assets/Male/9.png'),
  require('../../assets/Male/10.png'),
  require('../../assets/Male/11.png'),
  require('../../assets/Male/12.png'),
  require('../../assets/Male/13.png'),
  require('../../assets/Male/14.png'),
  require('../../assets/Male/15.png'),
];

export const femaleAvatars = [
  require('../../assets/Female/1.png'),
  require('../../assets/Female/2.png'),
  require('../../assets/Female/3.png'),
  require('../../assets/Female/4.png'),
  require('../../assets/Female/5.png'),
  require('../../assets/Female/6.png'),
  require('../../assets/Female/7.png'),
  require('../../assets/Female/8.png'),
  require('../../assets/Female/9.png'),
  require('../../assets/Female/10.png'),
  require('../../assets/Female/11.png'),
  require('../../assets/Female/12.png'),
  require('../../assets/Female/13.png'),
  require('../../assets/Female/14.png'),
  require('../../assets/Female/15.png'),
];

// Get random avatar based on gender
export const getRandomAvatar = (gender) => {
  const avatars = gender === 'male' ? maleAvatars : femaleAvatars;
  const randomIndex = Math.floor(Math.random() * avatars.length);
  return avatars[randomIndex];
};

// Get avatar by index (useful for selection screen)
export const getAvatarByIndex = (gender, index) => {
  const avatars = gender === 'male' ? maleAvatars : femaleAvatars;
  return avatars[index % avatars.length];
};

// Default avatars for display
export const defaultMaleAvatar = require('../../assets/Male/1.png');
export const defaultFemaleAvatar = require('../../assets/Female/1.png');

// App logo
export const appLogo = require('../../assets/Icon .png');
export const appLogoBlack = require('../../assets/black-01.png');
export const appLogoWhite = require('../../assets/white-01.png');
