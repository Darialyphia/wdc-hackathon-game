import pkgJson from '../../package.json';

export const useConfig = () => {
  return {
    version: pkgJson.version
  };
};
