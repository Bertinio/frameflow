"use client";

import { useMemo, useState } from "react";
import {
  PRODUCT_TYPES,
  type ManufacturerProductType,
} from "@/app/manufacturer/products/types";

type ProductFormValues = {
  type: ManufacturerProductType;
  name: string;
  pricePerM2: string;
  fixedPrice: string;
  surchargeType: "percent" | "fixed";
  surchargeValue: string;
};

type Props = {
  title: string;
  description: string;
  submitLabel: string;
  action: (formData: FormData) => Promise<void>;
  initialValues?: Partial<ProductFormValues>;
};

export default function ProductForm({
  title,
  description,
  submitLabel,
  action,
  initialValues,
}: Props) {
  const [type, setType] = useState<ManufacturerProductType>(initialValues?.type ?? "lamel");

  const defaults = useMemo(
    () => ({
      name: initialValues?.name ?? "",
      pricePerM2: initialValues?.pricePerM2 ?? "",
      fixedPrice: initialValues?.fixedPrice ?? "",
      surchargeType: initialValues?.surchargeType ?? "percent",
      surchargeValue: initialValues?.surchargeValue ?? "",
    }),
    [initialValues],
  );

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header className="rounded-2xl border border-gray-700 bg-gray-800 p-6">
        <h1 className="text-2xl font-semibold text-white">{title}</h1>
        <p className="mt-2 text-sm text-gray-300">{description}</p>
      </header>

      <form action={action} className="rounded-2xl border border-gray-700 bg-gray-800 p-6">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="block md:col-span-2">
            <span className="text-sm text-gray-300">Type</span>
            <select
              name="type"
              value={type}
              onChange={(event) => setType(event.target.value as ManufacturerProductType)}
              className="mt-2 w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white"
              required
            >
              {PRODUCT_TYPES.map((item) => (
                <option key={item} value={item} className="bg-gray-800 text-white">
                  {item}
                </option>
              ))}
            </select>
          </label>

          <label className="block md:col-span-2">
            <span className="text-sm text-gray-300">Naam</span>
            <input
              name="name"
              defaultValue={defaults.name}
              className="mt-2 w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white"
              required
            />
          </label>

          {type === "lamel" ? (
            <label className="block md:col-span-2">
              <span className="text-sm text-gray-300">pricePerM2</span>
              <input
                name="pricePerM2"
                type="number"
                min={0.01}
                step="0.01"
                defaultValue={defaults.pricePerM2}
                className="mt-2 w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white"
                required
              />
            </label>
          ) : null}

          {type === "motor" || type === "kast" || type === "option" ? (
            <label className="block md:col-span-2">
              <span className="text-sm text-gray-300">fixedPrice</span>
              <input
                name="fixedPrice"
                type="number"
                min={0.01}
                step="0.01"
                defaultValue={defaults.fixedPrice}
                className="mt-2 w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white"
                required
              />
            </label>
          ) : null}

          {type === "color" ? (
            <>
              <label className="block">
                <span className="text-sm text-gray-300">surchargeType</span>
                <select
                  name="surchargeType"
                  defaultValue={defaults.surchargeType}
                  className="mt-2 w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white"
                  required
                >
                  <option value="percent" className="bg-gray-800 text-white">percent</option>
                  <option value="fixed" className="bg-gray-800 text-white">fixed</option>
                </select>
              </label>
              <label className="block">
                <span className="text-sm text-gray-300">surchargeValue</span>
                <input
                  name="surchargeValue"
                  type="number"
                  min={0}
                  step="0.01"
                  defaultValue={defaults.surchargeValue}
                  className="mt-2 w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white"
                  required
                />
              </label>
            </>
          ) : null}
        </div>

        <button
          type="submit"
          className="mt-6 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
        >
          {submitLabel}
        </button>
      </form>
    </div>
  );
}
