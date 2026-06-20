import ProductForm from "@/app/manufacturer/products/ProductForm";
import { createManufacturerProduct } from "@/app/manufacturer/products/actions";
import { requireManufacturerContext } from "@/app/manufacturer/_lib";

export default async function ManufacturerNewProductPage() {
  await requireManufacturerContext();

  return (
    <ProductForm
      title="Nieuw product"
      description="Maak een nieuw fabrikantproduct aan."
      submitLabel="Product aanmaken"
      action={createManufacturerProduct}
      initialValues={{ type: "lamel", surchargeType: "percent" }}
    />
  );
}
