"use client";

import { useCallback, useEffect, useState } from "react";
import type { ProductAddOn } from "@/lib/products";
import { useQuoteSelection } from "@/lib/quote-selection";
import NotificationBanner from "./NotificationBanner";
import QuoteAddOnSelector from "./QuoteAddOnSelector";

interface ProductAddOnsQuotePickerProps {
  productId: string;
  productName: string;
  productCapacity: string;
  addOns: ProductAddOn[];
}

function mapSelectedAddOns(addOns: ProductAddOn[], selectedIds: string[]) {
  return addOns
    .filter((addOn) => selectedIds.includes(addOn.id))
    .map((addOn) => ({ id: addOn.id, name: addOn.name }));
}

function getAddOnName(addOns: ProductAddOn[], id: string) {
  return addOns.find((addOn) => addOn.id === id)?.name ?? "Agregado";
}

export default function ProductAddOnsQuotePicker({
  productId,
  productName,
  productCapacity,
  addOns,
}: ProductAddOnsQuotePickerProps) {
  const { hasProduct, products, addProduct, updateProductAddOns } =
    useQuoteSelection();
  const inQuote = hasProduct(productId);
  const existing = products.find((product) => product.id === productId);
  const syncedIds =
    existing?.selectedAddOns?.map((addOn) => addOn.id).join("|") ?? "";
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [notification, setNotification] = useState("");
  const [notificationVisible, setNotificationVisible] = useState(false);

  const dismissNotification = useCallback(() => {
    setNotificationVisible(false);
  }, []);

  useEffect(() => {
    if (!inQuote) {
      setSelectedIds([]);
      return;
    }

    setSelectedIds(
      existing?.selectedAddOns?.map((addOn) => addOn.id) ?? [],
    );
  }, [productId, inQuote, syncedIds, existing?.selectedAddOns]);

  function showNotification(message: string) {
    setNotification(message);
    setNotificationVisible(true);
  }

  if (addOns.length === 0) {
    return null;
  }

  function handleChange(ids: string[]) {
    const added = ids.filter((id) => !selectedIds.includes(id));
    const removed = selectedIds.filter((id) => !ids.includes(id));
    const wasInQuote = inQuote;

    setSelectedIds(ids);
    const selectedAddOns = mapSelectedAddOns(addOns, ids);

    if (inQuote) {
      updateProductAddOns(productId, selectedAddOns);
    } else {
      addProduct({
        id: productId,
        name: productName,
        capacity: productCapacity,
        selectedAddOns,
      });
    }

    if (added.length > 0) {
      const name = getAddOnName(addOns, added[0]);
      if (!wasInQuote) {
        showNotification(`${productName} agregado a su cotización · ${name}.`);
      } else {
        showNotification(`${name} incluido en su cotización.`);
      }
      return;
    }

    if (removed.length > 0) {
      showNotification(
        `${getAddOnName(addOns, removed[0])} quitado de su cotización.`,
      );
    }
  }

  return (
    <>
      <QuoteAddOnSelector
        addOns={addOns}
        selectedIds={selectedIds}
        onChange={handleChange}
        className="mt-5"
      />
      <NotificationBanner
        message={notification}
        visible={notificationVisible}
        onDismiss={dismissNotification}
      />
    </>
  );
}
