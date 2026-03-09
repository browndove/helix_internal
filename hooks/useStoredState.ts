"use client";

import { Dispatch, SetStateAction, useEffect, useState } from "react";

type StoredState<T> = [T, Dispatch<SetStateAction<T>>, boolean];

export function useStoredState<T>(storageKey: string, fallbackValue: T): StoredState<T> {
  const [value, setValue] = useState<T>(fallbackValue);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    try {
      const storedValue = window.localStorage.getItem(storageKey);

      if (storedValue !== null) {
        setValue(JSON.parse(storedValue) as T);
      }
    } catch (error) {
      console.error(`Failed to read local storage key "${storageKey}"`, error);
    } finally {
      setIsReady(true);
    }
  }, [storageKey]);

  useEffect(() => {
    if (!isReady) {
      return;
    }

    try {
      window.localStorage.setItem(storageKey, JSON.stringify(value));
    } catch (error) {
      console.error(`Failed to write local storage key "${storageKey}"`, error);
    }
  }, [isReady, storageKey, value]);

  return [value, setValue, isReady];
}

