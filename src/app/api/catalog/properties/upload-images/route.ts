import { NextResponse } from "next/server";
import { canAdminEditCatalog } from "@/lib/auth/admin-access";
import { uploadPropertyImagesToStorage } from "@/lib/supabase/upload-property-images-server";

const MAX_FILES = 20;
const MAX_FILE_BYTES = 10 * 1024 * 1024;

export async function POST(request: Request) {
  if (!(await canAdminEditCatalog())) {
    return NextResponse.json({ error: "אין הרשאה" }, { status: 403 });
  }

  try {
    const formData = await request.formData();
    const entries = formData.getAll("files");
    const files = entries.filter((entry): entry is File => entry instanceof File);

    if (files.length === 0) {
      return NextResponse.json({ error: "לא נבחרו קבצים להעלאה" }, { status: 400 });
    }

    if (files.length > MAX_FILES) {
      return NextResponse.json(
        { error: `ניתן להעלות עד ${MAX_FILES} תמונות בכל פעם` },
        { status: 400 }
      );
    }

    for (const file of files) {
      if (!file.type.startsWith("image/")) {
        return NextResponse.json({ error: "ניתן להעלות קבצי תמונה בלבד" }, { status: 400 });
      }
      if (file.size > MAX_FILE_BYTES) {
        return NextResponse.json(
          { error: `הקובץ ${file.name} גדול מדי (מקסימום 10MB)` },
          { status: 400 }
        );
      }
    }

    const urls = await uploadPropertyImagesToStorage(files);
    return NextResponse.json({ success: true, urls });
  } catch (error) {
    console.error("[POST /api/catalog/properties/upload-images]", error);
    const message = error instanceof Error ? error.message : "העלאת התמונות נכשלה";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";
