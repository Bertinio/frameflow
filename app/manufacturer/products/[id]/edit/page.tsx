import { redirect } from "next/navigation";
import ProductForm from "@/app/manufacturer/products/ProductForm";
import { updateManufacturerProduct } from "@/app/manufacturer/products/actions";
import { requireManufacturerContext } from "@/app/manufacturer/_lib";
import { prisma } from "@/lib/prisma";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function ManufacturerEditProductPage({ params }: PageProps) {
  const { manufacturer } = await requireManufacturerContext();
  const { id } = await params;

  const product = await prisma.manufacturerProduct.findFirst({
    where: {
      id,
      manufacturerId: manufacturer.id,
    },
  });

  if (!product) {
    redirect("/manufacturer/products");
  }

  const updateAction = updateManufacturerProduct.bind(null, product.id);

  return (
    <ProductForm
      title="Product bewerken"
      description="Pas bestaande fabrikantproductgegevens aan."
      submitLabel="Wijzigingen opslaan"
      action={updateAction}
      initialValues={{
        type: product.type as any,
        name: product.name,
        pricePerM2: product.pricePerM2 ? String(product.pricePerM2) : "",
        fixedPrice: product.fixedPrice ? String(product.fixedPrice) : "",
        surchargeType: (product.surchargeType as "percent" | "fixed" | null) ?? "percent",
        surchargeValue: product.surchargeValue ? String(product.surchargeValue) : "",
      }}
    />
  );
}
