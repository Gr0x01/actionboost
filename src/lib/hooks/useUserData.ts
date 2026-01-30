"use client";

import { useState, useEffect, useCallback } from "react";

interface UserData {
  credits: number;
  email: string;
  loggedIn: boolean;
}

let cachedPromise: Promise<UserData> | null = null;
let cachedData: UserData | null = null;

function fetchUserData(): Promise<UserData> {
  if (cachedPromise) return cachedPromise;

  cachedPromise = fetch("/api/user/credits")
    .then((res) => {
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    })
    .then((data) => {
      cachedData = {
        credits: data.credits ?? 0,
        email: data.email ?? "",
        loggedIn: data.loggedIn ?? false,
      };
      return cachedData;
    })
    .catch(() => {
      cachedPromise = null;
      return { credits: 0, email: "", loggedIn: false };
    });

  return cachedPromise;
}

export function useUserData() {
  const [data, setData] = useState<UserData>(
    cachedData ?? { credits: 0, email: "", loggedIn: false }
  );
  const [isLoading, setIsLoading] = useState(!cachedData);

  useEffect(() => {
    if (cachedData) {
      setData(cachedData);
      setIsLoading(false);
      return;
    }

    fetchUserData().then((result) => {
      setData(result);
      setIsLoading(false);
    });
  }, []);

  const refetch = useCallback(() => {
    cachedPromise = null;
    cachedData = null;
    setIsLoading(true);
    fetchUserData().then((result) => {
      setData(result);
      setIsLoading(false);
    });
  }, []);

  return {
    credits: data.credits,
    email: data.email,
    loggedIn: data.loggedIn,
    isLoading,
    refetch,
  };
}
