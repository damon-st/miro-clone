"use client";
import { useRouter } from "next/navigation";
import qs from "query-string";
import { useDebounceValue } from "usehooks-ts";

import { ChangeEvent, useEffect, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export const SearchInput = () => {
  const router = useRouter();
  const [value, setValue] = useDebounceValue("", 500);
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
  };
  useEffect(() => {
    const url = qs.stringifyUrl(
      {
        url: "/",
        query: {
          search: value,
        },
      },
      { skipEmptyString: true, skipNull: true }
    );
    router.push(url);
  }, [router, value]);

  return (
    <div className="w-full relative">
      <Search className="absolute top-1/2 left-3 transform -translate-y-1/2 text-muted-foreground size-4" />
      <Input
        onChange={handleChange}
        className="w-full max-w-[516px] pl-9"
        placeholder="Search boards"
      />
    </div>
  );
};
