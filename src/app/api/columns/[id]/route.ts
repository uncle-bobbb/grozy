export const runtime = 'nodejs';

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase/server";

// 특정 칼럼 조회 API
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // params를 await 처리
    const { id } = await params;
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;
    
    // Supabase 클라이언트 생성 방식 변경
    const supabase = createServiceClient();
    
    // 칼럼 정보 조회 (expertise 필드 제거 또는 수정)
    const { data: column, error } = await supabase
      .from("columns")
      .select(`
        *,
        users:author_id (
          id,
          name,
          image,
          role
        )
      `)
      .eq("id", id)
      .single();
      
    if (error) {
      console.error("칼럼 조회 오류:", error);
      return NextResponse.json(
        { error: "칼럼을 불러오는 중 오류가 발생했습니다." },
        { status: 500 }
      );
    }
    
    if (!column) {
      return NextResponse.json(
        { error: "해당 칼럼을 찾을 수 없습니다." },
        { status: 404 }
      );
    }
    
    // 조회수 증가 (본인 글 제외)
    if (userId && userId !== column.author_id) {
      await supabase
        .from("columns")
        .update({ view_count: column.view_count + 1 })
        .eq("id", id);
    }
    
    // 좋아요 상태 확인
    let liked = false;
    if (userId) {
      const { data: likeData } = await supabase
        .from("likes")
        .select("id")
        .eq("author_id", userId)
        .eq("post_id", id)
        .eq("post_type", "column")
        .single();
      
      liked = !!likeData;
    }
    
    // 응답 데이터 구성
    const responseData = {
      ...column,
      liked,
    };
    
    return NextResponse.json(responseData);
  } catch (error) {
    console.error("칼럼 조회 처리 오류:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

// 칼럼 수정 API
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // params를 await 처리
    const { id } = await params;
    
    // 세션 가져오기
    const session = await getServerSession(authOptions);
    
    // 로그인 확인
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "로그인이 필요한 기능입니다." }, 
        { status: 401 }
      );
    }
    
    // Supabase 클라이언트 생성 방식 변경
    const supabase = createServiceClient();
    
    // 기존 칼럼 조회
    const { data: existingColumn, error: fetchError } = await supabase
      .from("columns")
      .select("author_id")
      .eq("id", id)
      .single();
      
    if (fetchError) {
      return NextResponse.json(
        { error: "칼럼을 찾을 수 없습니다." },
        { status: 404 }
      );
    }
    
    // 권한 확인 (작성자 또는 관리자만 수정 가능)
    if (
      existingColumn.author_id !== session.user.id && 
      session.user.role !== "admin"
    ) {
      return NextResponse.json(
        { error: "이 칼럼을 수정할 권한이 없습니다." },
        { status: 403 }
      );
    }
    
    // 요청 데이터 파싱
    const data = await request.json();
    
    // 필수 필드 검증
    if (!data.title || !data.content) {
      return NextResponse.json(
        { error: "제목과 내용은 필수 입력 항목입니다." },
        { status: 400 }
      );
    }
    
    const updateData = {
      title: data.title,
      content: data.content,
      image_url: data.image_url,
    };
    
    // 칼럼 업데이트
    const { data: updatedColumn, error: updateError } = await supabase
      .from("columns")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();
      
    if (updateError) {
      console.error("칼럼 수정 오류:", updateError);
      return NextResponse.json(
        { error: "칼럼 수정 중 오류가 발생했습니다." },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      message: "칼럼이 성공적으로 수정되었습니다.",
      column: updatedColumn
    });
  } catch (error) {
    console.error("칼럼 수정 처리 오류:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

// 칼럼 삭제 API
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // params를 await 처리
    const { id } = await params;
    
    // 세션 가져오기
    const session = await getServerSession(authOptions);
    
    // 로그인 확인
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "로그인이 필요한 기능입니다." }, 
        { status: 401 }
      );
    }
    
    // Supabase 클라이언트 생성 방식 변경
    const supabase = createServiceClient();
    
    // 기존 칼럼 조회
    const { data: existingColumn, error: fetchError } = await supabase
      .from("columns")
      .select("author_id")
      .eq("id", id)
      .single();
      
    if (fetchError) {
      return NextResponse.json(
        { error: "칼럼을 찾을 수 없습니다." },
        { status: 404 }
      );
    }
    
    // 권한 확인 (작성자 또는 관리자만 삭제 가능)
    if (
      existingColumn.author_id !== session.user.id && 
      session.user.role !== "admin"
    ) {
      return NextResponse.json(
        { error: "이 칼럼을 삭제할 권한이 없습니다." },
        { status: 403 }
      );
    }
    
    // 트랜잭션 시작 (원자적 연산 처리)
    // 1. 관련 좋아요 데이터 삭제
    const { error: likesDeleteError } = await supabase
      .from("likes")
      .delete()
      .eq("post_id", id)
      .eq("post_type", "column");
      
    if (likesDeleteError) {
      console.error("칼럼 관련 좋아요 삭제 오류:", likesDeleteError);
      return NextResponse.json(
        { error: "칼럼 관련 좋아요 삭제 중 오류가 발생했습니다." },
        { status: 500 }
      );
    }
    
    // 2. 관련 댓글 삭제
    const { error: commentsDeleteError } = await supabase
      .from("comments")
      .delete()
      .eq("post_id", id)
      .eq("post_type", "column");
      
    if (commentsDeleteError) {
      console.error("칼럼 관련 댓글 삭제 오류:", commentsDeleteError);
      return NextResponse.json(
        { error: "칼럼 관련 댓글 삭제 중 오류가 발생했습니다." },
        { status: 500 }
      );
    }
    
    // 3. 관련 이미지 삭제 (Storage에 이미지가 저장된 경우)
    // 칼럼에 이미지가 있는지 확인하기 위해 칼럼 전체 데이터 조회
    const { data: columnData, error: columnDataError } = await supabase
      .from("columns")
      .select("image_url, content")
      .eq("id", id)
      .single();
      
    if (!columnDataError && columnData) {
      // 1. 썸네일 이미지 삭제
      if (columnData.image_url) {
        try {
          let imagePath;
          
          // 절대 URL인 경우 (https://...)
          if (columnData.image_url.startsWith('http')) {
            const imageUrl = new URL(columnData.image_url);
            // Supabase Storage URL 형식: {baseUrl}/storage/v1/object/public/{bucket}/{filePath}
            const pathSegments = imageUrl.pathname.split('/');
            // 'public' 다음 세그먼트가 버킷 이름이고 그 다음이 파일 경로
            const publicIndex = pathSegments.indexOf('public');
            
            if (publicIndex !== -1 && publicIndex + 1 < pathSegments.length) {
              const bucket = pathSegments[publicIndex + 1];
              // 파일 경로 (버킷 이후 모든 세그먼트)
              imagePath = pathSegments.slice(publicIndex + 2).join('/');
              
              if (imagePath) {
                console.log(`삭제할 이미지 경로: 버킷=${bucket}, 경로=${imagePath}`);
                const { error: imageDeleteError } = await supabase
                  .storage
                  .from(bucket)
                  .remove([imagePath]);
                  
                if (imageDeleteError) {
                  console.error("썸네일 이미지 삭제 오류:", imageDeleteError);
                } else {
                  console.log("썸네일 이미지 삭제 성공:", imagePath);
                }
              }
            } else {
              // 단순히 파일명만 추출하여 기본 버킷에서 삭제 시도
              imagePath = imageUrl.pathname.split('/').pop();
              if (imagePath) {
                // uploads 버킷에서 이미지 삭제
                const { error: imageDeleteError } = await supabase
                  .storage
                  .from('uploads')
                  .remove([imagePath]);
                  
                if (imageDeleteError) {
                  console.error("기본 썸네일 이미지 삭제 오류:", imageDeleteError);
                } else {
                  console.log("기본 썸네일 이미지 삭제 성공:", imagePath);
                }
              }
            }
          } 
          // 상대 경로인 경우 (/storage/... 또는 단순 파일명)
          else {
            // 상대 경로에서 파일명이나 경로 추출
            let pathToDelete = columnData.image_url;
            
            // /storage/v1/object/public/{bucket}/{filePath} 형식인 경우
            if (columnData.image_url.includes('/storage/')) {
              const segments = columnData.image_url.split('/');
              const publicIndex = segments.indexOf('public');
              
              if (publicIndex !== -1 && publicIndex + 1 < segments.length) {
                const bucket = segments[publicIndex + 1];
                // 파일 경로 (버킷 이후 모든 세그먼트)
                pathToDelete = segments.slice(publicIndex + 2).join('/');
                
                if (pathToDelete) {
                  console.log(`상대경로 이미지 삭제: 버킷=${bucket}, 경로=${pathToDelete}`);
                  const { error: imageDeleteError } = await supabase
                    .storage
                    .from(bucket)
                    .remove([pathToDelete]);
                    
                  if (imageDeleteError) {
                    console.error("상대경로 이미지 삭제 오류:", imageDeleteError);
                  } else {
                    console.log("상대경로 이미지 삭제 성공:", pathToDelete);
                  }
                }
              }
            } 
            // 단순 파일명인 경우
            else {
              // uploads 버킷에서 이미지 삭제
              console.log(`파일명 이미지 삭제: ${pathToDelete}`);
              const { error: imageDeleteError } = await supabase
                .storage
                .from('uploads')
                .remove([pathToDelete]);
                
              if (imageDeleteError) {
                console.error("파일명 이미지 삭제 오류:", imageDeleteError);
              } else {
                console.log("파일명 이미지 삭제 성공:", pathToDelete);
              }
            }
          }
        } catch (imageError) {
          console.error("이미지 URL 처리 오류:", imageError);
        }
      }
      
      // 2. 본문 내용에 포함된 이미지 삭제 (선택적)
      if (columnData.content) {
        try {
          // 본문에서 이미지 URL 추출 (정규식 사용)
          const imgRegex = /<img[^>]+src="([^">]+)"/g;
          let match;
          const contentImageUrls = [];
          
          // 본문에서 모든 이미지 URL 추출
          while ((match = imgRegex.exec(columnData.content)) !== null) {
            if (match[1] && !match[1].startsWith('http://placekitten.com') && 
                !match[1].startsWith('https://picsum.photos')) {
              contentImageUrls.push(match[1]);
            }
          }
          
          // 추출된 각 이미지 URL에 대해 삭제 시도
          for (const imgUrl of contentImageUrls) {
            try {
              let bucket = 'uploads'; // 기본 버킷
              let pathToDelete = '';
              
              // URL 형식에 따라 처리
              if (imgUrl.startsWith('http')) {
                const urlObj = new URL(imgUrl);
                const segments = urlObj.pathname.split('/');
                const publicIndex = segments.indexOf('public');
                
                if (publicIndex !== -1 && publicIndex + 1 < segments.length) {
                  bucket = segments[publicIndex + 1];
                  pathToDelete = segments.slice(publicIndex + 2).join('/');
                } else {
                  pathToDelete = segments[segments.length - 1];
                }
              } else if (imgUrl.includes('/storage/')) {
                const segments = imgUrl.split('/');
                const publicIndex = segments.indexOf('public');
                
                if (publicIndex !== -1 && publicIndex + 1 < segments.length) {
                  bucket = segments[publicIndex + 1];
                  pathToDelete = segments.slice(publicIndex + 2).join('/');
                } else {
                  pathToDelete = segments[segments.length - 1];
                }
              } else {
                pathToDelete = imgUrl;
              }
              
              if (pathToDelete) {
                console.log(`본문 이미지 삭제: 버킷=${bucket}, 경로=${pathToDelete}`);
                const { error: contentImageDeleteError } = await supabase
                  .storage
                  .from(bucket)
                  .remove([pathToDelete]);
                  
                if (contentImageDeleteError) {
                  console.error(`본문 이미지 삭제 오류 (${pathToDelete}):`, contentImageDeleteError);
                } else {
                  console.log(`본문 이미지 삭제 성공: ${pathToDelete}`);
                }
              }
            } catch (urlError) {
              console.error(`본문 이미지 URL 처리 오류 (${imgUrl}):`, urlError);
            }
          }
        } catch (contentError) {
          console.error("본문 이미지 처리 오류:", contentError);
        }
      }
    }
    
    // 4. 마지막으로 칼럼 자체 삭제
    const { error: deleteError } = await supabase
      .from("columns")
      .delete()
      .eq("id", id);
      
    if (deleteError) {
      console.error("칼럼 삭제 오류:", deleteError);
      return NextResponse.json(
        { error: "칼럼 삭제 중 오류가 발생했습니다." },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      message: "칼럼 및 관련된 모든 데이터가 성공적으로 삭제되었습니다.",
    });
  } catch (error) {
    console.error("칼럼 삭제 처리 오류:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
} 