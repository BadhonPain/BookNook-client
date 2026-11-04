"use client";

import { ImagePlus } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/components/ToastProvider";
import { authClient } from "@/lib/auth-client";
import { apiRequest } from "@/lib/api";
import { uploadBookCover } from "@/lib/images";
import type { Book, BookCategory } from "@/lib/types";

const categories: BookCategory[] = ["Fiction", "Science", "History", "Kids", "Others"];

type BookEditorProps = {
  book?: Book;
  onSaved: (book: Book) => void;
};

export default function BookEditor({ book, onSaved }: BookEditorProps) {
  const { notify } = useToast();
  const { data: session } = authClient.useSession();
  const [title, setTitle] = useState(book?.title || "");
  const [author, setAuthor] = useState(book?.author || "");
  const [category, setCategory] = useState<BookCategory>(book?.category || "Fiction");
  const [image, setImage] = useState(book?.image || "");
  const [description, setDescription] = useState(book?.description || "");
  const [totalCopies, setTotalCopies] = useState(String(book?.totalCopies ?? 1));
  const [uploading, setUploading] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function handleUpload(file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Choose an image file for the book cover.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("Choose an image smaller than 10 MB.");
      return;
    }
    setUploading(true);
    setError("");
    try {
      setImage(await uploadBookCover(file));
      notify("Book cover uploaded.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "The image could not be uploaded.");
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setPending(true);
    const body = JSON.stringify({
      title: title.trim(),
      author: author.trim(),
      category,
      image,
      description: description.trim(),
      totalCopies: Number(totalCopies),
    });

    try {
      const result = await apiRequest<{ message: string; book: Book }>(
        book ? `/books/${encodeURIComponent(book._id)}` : "/books",
        {
          method: book ? "PATCH" : "POST",
          authenticated: true,
          body,
        },
      );
      notify(result.message);
      onSaved(result.book);
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : "The book could not be saved.";
      setError(message);
      notify(message, "error");
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="form-stack" onSubmit={handleSubmit}>
      <label className="form-field">
        Book title
        <input maxLength={140} onChange={(event) => setTitle(event.target.value)} required value={title} />
      </label>
      <label className="form-field">
        Author name
        <input maxLength={140} onChange={(event) => setAuthor(event.target.value)} required value={author} />
      </label>
      <label className="form-field">
        Category
        <select onChange={(event) => setCategory(event.target.value as BookCategory)} value={category}>
          {categories.map((item) => <option key={item}>{item}</option>)}
        </select>
      </label>
      <label className="form-field">
        Book cover image
        <span className="image-upload-row">
          <input
            accept="image/*"
            aria-label="Upload a book cover image"
            onChange={(event) => void handleUpload(event.target.files?.[0])}
            type="file"
          />
          <span className="image-upload-status" aria-live="polite">
            <ImagePlus size={16} aria-hidden="true" />
            {uploading ? "Uploading..." : image ? "Cover ready" : "Upload a cover"}
          </span>
        </span>
        <input
          aria-label="Book cover image URL"
          onChange={(event) => setImage(event.target.value)}
          placeholder="Or paste an image URL"
          required
          type="url"
          value={image}
        />
      </label>
      <label className="form-field">
        Short description
        <textarea
          maxLength={2000}
          onChange={(event) => setDescription(event.target.value)}
          required
          rows={5}
          value={description}
        />
      </label>
      <label className="form-field">
        Available copies
        <input
          min={book ? 0 : 1}
          onChange={(event) => setTotalCopies(event.target.value)}
          required
          type="number"
          value={totalCopies}
        />
        <span className="form-hint">Available copies decrease while a book is borrowed.</span>
      </label>
      <label className="form-field">
        Added by
        <input readOnly value={book?.addedBy.name || session?.user.name || ""} />
      </label>
      <label className="form-field">
        Added by email
        <input readOnly type="email" value={book?.addedBy.email || session?.user.email || ""} />
      </label>
      {error && <p className="form-error" role="alert">{error}</p>}
      <button className="button" disabled={pending || uploading} type="submit">
        {pending ? "Saving..." : book ? "Save changes" : "Add book"}
      </button>
    </form>
  );
}
