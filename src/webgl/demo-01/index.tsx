import { type FC } from 'react';

interface Demo01Props {
  [key: string]: never;
}

const Demo01: FC<Demo01Props> = () => {
  return 'Hello, WebGL!';
};

export default Demo01;
