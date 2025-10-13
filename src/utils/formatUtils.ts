export function formatDuration(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function formatFileSize(sizeInKB: number) {
  if (sizeInKB >= 1024) {
    const mb = sizeInKB / 1024;
    // Use toFixed(2) for more precision, then remove trailing zeros
    return `${parseFloat(mb.toFixed(2))} MB`;
  } else {
    return `${sizeInKB.toFixed(1)} KB`;
  }
}

export function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-TH", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
