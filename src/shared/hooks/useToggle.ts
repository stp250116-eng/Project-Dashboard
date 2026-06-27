import { useState, useCallback } from 'react';

/** Simple typed toggle hook used by panels and dialogs. */
export const useToggle = (initial = false): [boolean, () => void, (value: boolean) => void] => {
  const [value, setValue] = useState<boolean>(initial);
  const toggle = useCallback(() => setValue((prev) => !prev), []);
  return [value, toggle, setValue];
};
