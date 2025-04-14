import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase/server";
import { v4 as uuidv4 } from "uuid";
import sharp from "sharp";

export async function POST(request: NextRequest) {
  try {
    // 세션 확인
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "로그인이 필요한 기능입니다." },
        { status: 401 }
      );
    }

    // 폼 데이터 처리
    const formData = await request.formData();
    const file = formData.get("file") as File;

    // 파일 유효성 검사
    if (!file) {
      return NextResponse.json(
        { error: "파일이 제공되지 않았습니다." },
        { status: 400 }
      );
    }

    // 이미지 파일 타입 검사
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "이미지 파일만 업로드 가능합니다." },
        { status: 400 }
      );
    }

    // 파일 크기 제한 (1MB)
    const maxSize = 1 * 1024 * 1024; // 1MB

    // 파일 이름 생성 (고유한 ID 사용)
    const fileExtension = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const fileName = `${uuidv4()}.${fileExtension}`;
    const storagePath = `column-images/${fileName}`;

    // 파일을 버퍼로 변환
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 이미지 리사이징 및 압축 설정
    let processedBuffer: Buffer;
    let contentType: string;

    // 이미지 형식에 따른 처리
    try {
      if (file.type === "image/gif") {
        // GIF는 특별한 처리 없이 그대로 저장 (애니메이션 보존)
        processedBuffer = buffer;
        contentType = "image/gif";
        
        // GIF가 1MB보다 크다면 경고 (GIF는 압축이 어려움)
        if (buffer.length > maxSize) {
          console.warn("큰 GIF 파일이 업로드됨:", buffer.length / (1024 * 1024), "MB");
        }
      } else if (file.type === "image/png") {
        // PNG 이미지 처리 (투명도 보존)
        processedBuffer = await sharp(buffer)
          .resize(1200, 1200, { fit: "inside", withoutEnlargement: true })
          .png({ quality: 80, compressionLevel: 9 }) // 압축 수준 최대
          .toBuffer();
        contentType = "image/png";
      } else if (file.type === "image/webp") {
        // WebP 이미지 처리
        processedBuffer = await sharp(buffer)
          .resize(1200, 1200, { fit: "inside", withoutEnlargement: true })
          .webp({ quality: 80 }) // 품질 80%
          .toBuffer();
        contentType = "image/webp";
      } else {
        // 기본 JPEG 처리 (다른 형식도 JPEG로 변환)
        processedBuffer = await sharp(buffer)
          .resize(1200, 1200, { fit: "inside", withoutEnlargement: true })
          .jpeg({ quality: 80 }) // 품질 80%
          .toBuffer();
        contentType = "image/jpeg";
      }

      // 처리된 이미지 크기 확인 (1MB 이하로 만들기)
      if (processedBuffer.length > maxSize && contentType !== "image/gif") {
        // 추가 압축 시도 (품질 더 낮추기)
        processedBuffer = await sharp(buffer)
          .resize(1000, 1000, { fit: "inside", withoutEnlargement: true })
          .jpeg({ quality: 60 }) // 품질 60%로 낮춤
          .toBuffer();
        
        // 그래도 크다면 더 작게 리사이징
        if (processedBuffer.length > maxSize) {
          processedBuffer = await sharp(buffer)
            .resize(800, 800, { fit: "inside", withoutEnlargement: true })
            .jpeg({ quality: 50 }) // 품질 50%로 낮춤
            .toBuffer();
            
          // 마지막 수단: 극단적 압축
          if (processedBuffer.length > maxSize) {
            processedBuffer = await sharp(buffer)
              .resize(600, 600, { fit: "inside", withoutEnlargement: true })
              .jpeg({ quality: 40 }) // 품질 40%로 낮춤
              .toBuffer();
          }
        }
        
        // JPEG로 변환했으므로 콘텐츠 타입 조정
        contentType = "image/jpeg";
      }
    } catch (sharpError) {
      console.error("이미지 처리 중 오류:", sharpError);
      return NextResponse.json(
        { error: "이미지 처리 중 오류가 발생했습니다." },
        { status: 500 }
      );
    }

    // Supabase 클라이언트 생성
    const supabase = createServiceClient();

    // Supabase Storage에 파일 업로드
    const { data, error } = await supabase.storage
      .from('uploads')  // 스토리지 버킷 이름
      .upload(storagePath, processedBuffer, {
        contentType: contentType,
        upsert: true, // 같은 이름의 파일이 있으면 덮어쓰기
      });

    if (error) {
      console.error("파일 업로드 오류:", error);
      return NextResponse.json(
        { error: "파일 업로드 중 오류가 발생했습니다." },
        { status: 500 }
      );
    }

    // 파일 URL 생성
    const { data: urlData } = await supabase.storage
      .from('uploads')
      .getPublicUrl(storagePath);

    return NextResponse.json(
      { url: urlData.publicUrl },
      { status: 200 }
    );
  } catch (error) {
    console.error("파일 업로드 처리 중 오류:", error);
    return NextResponse.json(
      { error: "파일 업로드 처리 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
} 