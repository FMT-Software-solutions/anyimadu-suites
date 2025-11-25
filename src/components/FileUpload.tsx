import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Plus } from 'lucide-react';

interface Props {
  multiple?: boolean;
  maxFiles?: number;
  accept?: string;
  folder?: string;
  onUploaded: (urls: string[]) => void;
  className?: string;
  text?: string;
  buttonLabel?: string;
  allowedMimeTypes?: string[];
  maxSizeMB?: number;
  showThumbnails?: boolean;
  currentCount?: number;
}

export const FileUpload: React.FC<Props> = ({
  multiple = true,
  maxFiles = 3,
  accept = 'image/*',
  folder = 'uploads',
  onUploaded,
  className,
  text = 'Drop files here or click to browse',
  buttonLabel = 'Add files',
  allowedMimeTypes = ['image/*'],
  maxSizeMB = 10,
  showThumbnails = true,
  currentCount = 0,
}) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [items, setItems] = useState<
    {
      id: string;
      file: File;
      previewUrl: string | null;
      progress: number;
      status: 'queued' | 'uploading' | 'done' | 'error';
      uploadedUrl?: string;
      error?: string;
    }[]
  >([]);
  const [message, setMessage] = useState<string | null>(null);

  const pickFiles = () => {
    inputRef.current?.click();
  };

  const typeAllowed = (type: string) => {
    if (!allowedMimeTypes || allowedMimeTypes.length === 0) return true;
    return allowedMimeTypes.some((t) =>
      t.endsWith('/*') ? type.startsWith(t.replace('/*', '/')) : type === t
    );
  };

  const validate = (f: File): string | null => {
    if (f.size > maxSizeMB * 1024 * 1024)
      return `File too large: ${(f.size / (1024 * 1024)).toFixed(
        2
      )}MB > ${maxSizeMB}MB`;
    if (!typeAllowed(f.type)) return `File type not allowed: ${f.type}`;
    return null;
  };

  const uploadOne = async (
    itemId: string,
    file: File
  ): Promise<string | null> => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;
    return new Promise((resolve) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', `${supabaseUrl}/functions/v1/cloudinary-upload`);
      xhr.setRequestHeader('apikey', supabaseKey);
      xhr.setRequestHeader('Authorization', `Bearer ${supabaseKey}`);
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const pct = Math.round((e.loaded / e.total) * 100);
          setItems((prev) =>
            prev.map((it) => (it.id === itemId ? { ...it, progress: pct } : it))
          );
        } else {
          setItems((prev) =>
            prev.map((it) => (it.id === itemId ? { ...it, progress: 50 } : it))
          );
        }
      };
      xhr.onreadystatechange = () => {
        if (xhr.readyState === 4) {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const out = JSON.parse(xhr.responseText);
              const url = out?.secure_url ? String(out.secure_url) : null;
              setItems((prev) =>
                prev.map((it) =>
                  it.id === itemId
                    ? {
                        ...it,
                        status: 'done',
                        progress: 100,
                        uploadedUrl: url ?? undefined,
                      }
                    : it
                )
              );
              resolve(url);
              return;
            } catch {
              setItems((prev) =>
                prev.map((it) =>
                  it.id === itemId
                    ? { ...it, status: 'error', error: 'Invalid response' }
                    : it
                )
              );
            }
          } else {
            setItems((prev) =>
              prev.map((it) =>
                it.id === itemId
                  ? {
                      ...it,
                      status: 'error',
                      error: `Upload failed (${xhr.status})`,
                    }
                  : it
              )
            );
          }
          resolve(null);
        }
      };
      const fd = new FormData();
      fd.append('file', file);
      fd.append('folder', folder);
      setItems((prev) =>
        prev.map((it) =>
          it.id === itemId ? { ...it, status: 'uploading', progress: 0 } : it
        )
      );
      xhr.send(fd);
    });
  };

  const handleFiles = async (files: FileList | File[]) => {
    const reservedCount = items.filter(
      (i) =>
        i.status === 'queued' || i.status === 'uploading' || i.status === 'done'
    ).length;
    let remaining = Math.max(0, maxFiles - currentCount - reservedCount);
    if (remaining <= 0) {
      if (maxFiles === 1) {
        setMessage(null);
        remaining = 1;
      } else {
        setMessage(
          `Upload limit reached (max ${maxFiles} ${
            maxFiles === 1 ? 'file' : 'files'
          })`
        );
        return;
      }
    }
    let arr = Array.from(files);
    if (arr.length > remaining) {
      setMessage(
        `Only ${remaining} more ${
          remaining === 1 ? 'file is' : 'files are'
        } allowed. Extra ${arr.length - remaining} ignored.`
      );
      arr = arr.slice(0, remaining);
    } else {
      setMessage(null);
    }
    if (arr.length === 0) return;
    const newItems = arr.map((f) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const error = validate(f);
      return {
        id,
        file: f,
        previewUrl:
          showThumbnails && f.type.startsWith('image/')
            ? URL.createObjectURL(f)
            : null,
        progress: 0,
        status: (error ? 'error' : 'queued') as 'error' | 'queued',
        error: error || undefined,
      };
    });
    setItems((prev) => [...prev, ...newItems]);
    const valid = newItems.filter((i) => i.status !== 'error');
    if (valid.length === 0) return;
    setUploading(true);
    try {
      const urls: string[] = [];
      for (const it of valid) {
        const url = await uploadOne(it.id, it.file);
        if (url) urls.push(url);
      }
      if (urls.length > 0) onUploaded(urls);
    } finally {
      setUploading(false);
      setItems((prev) => prev.filter((it) => it.status === 'error'));
    }
  };

  const onDrop: React.DragEventHandler<HTMLDivElement> = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    if (uploading) return;
    const files = e.dataTransfer.files;
    await handleFiles(files);
  };

  const onChange: React.ChangeEventHandler<HTMLInputElement> = async (e) => {
    const files = e.target.files;
    if (!files) return;
    await handleFiles(files);
    e.target.value = '';
  };

  useEffect(() => {
    items.forEach((it) => {
      if (it.status === 'done' && it.previewUrl) {
        try {
          URL.revokeObjectURL(it.previewUrl);
        } catch {
          void 0;
        }
      }
    });
  }, [items]);

  useEffect(() => {
    const anyActive = items.some(
      (it) => it.status === 'queued' || it.status === 'uploading'
    );
    if (!anyActive) {
      const filtered = items.filter((it) => it.status === 'error');
      if (filtered.length !== items.length) {
        setItems(filtered);
      }
      if (message !== null) setMessage(null);
    }
  }, [items, message]);

  const reservedCountForRender = items.filter(
    (i) =>
      i.status === 'queued' || i.status === 'uploading' || i.status === 'done'
  ).length;
  const remainingSlots = Math.max(
    0,
    maxFiles - currentCount - reservedCountForRender
  );

  return (
    <>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        onClick={pickFiles}
        className={cn(
          'border border-dashed rounded-md p-3 md:p-4 flex items-center gap-3 cursor-pointer select-none',
          dragOver ? 'bg-muted/40' : 'bg-card',
          uploading ? 'opacity-75' : '',
          className
        )}
      >
        <Button
          type="button"
          disabled={uploading || (remainingSlots <= 0 && maxFiles !== 1)}
        >
          <Plus className="h-4 w-4 mr-2" /> {buttonLabel}
        </Button>
        <div className="text-sm text-muted-foreground">
          {text} (max {maxFiles} {maxFiles === 1 ? 'file' : 'files'})
        </div>
        <input
          ref={inputRef}
          type="file"
          multiple={multiple}
          accept={accept}
          onChange={onChange}
          className="hidden"
        />
      </div>
      {message ? (
        <div className="mt-1 text-xs text-primary">{message}</div>
      ) : null}
      {(() => {
        const anyActive = items.some(
          (it) => it.status === 'queued' || it.status === 'uploading'
        );
        return showThumbnails && anyActive ? (
          <FileUploadPreviewList items={items} />
        ) : null;
      })()}
    </>
  );
};

export const FileUploadPreviewList: React.FC<{
  items: {
    id: string;
    previewUrl: string | null;
    progress: number;
    status: 'queued' | 'uploading' | 'done' | 'error';
    error?: string;
  }[];
}> = ({ items }) => {
  if (items.length === 0) return null;
  return (
    <div className="mt-2 grid grid-cols-3 md:grid-cols-6 gap-2">
      {items.map((it) => (
        <div key={it.id} className="border rounded-md p-2">
          {it.previewUrl ? (
            <img
              src={it.previewUrl}
              alt="preview"
              className="w-full h-16 object-cover rounded"
            />
          ) : (
            <div className="w-full h-16 bg-muted rounded flex items-center justify-center text-xs text-muted-foreground">
              file
            </div>
          )}
          <div className="mt-1 h-1 w-full bg-muted rounded overflow-hidden">
            <div
              className={cn('h-1 bg-primary transition-all')}
              style={{ width: `${it.status === 'done' ? 100 : it.progress}%` }}
            />
          </div>
          <div className="mt-1 text-[10px] text-muted-foreground">
            {it.status === 'error' ? it.error || 'Error' : it.status}
          </div>
        </div>
      ))}
    </div>
  );
};
