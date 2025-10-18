import { NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json(
        { error: '파일이 없습니다.' },
        { status: 400 }
      );
    }

    // 파일 검증
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: '파일 크기는 5MB 이하여야 합니다.' },
        { status: 400 }
      );
    }

    // NCP Object Storage 설정
    const s3Client = new S3Client({
      region: process.env.NCP_REGION || 'kr-standard',
      credentials: {
        accessKeyId: process.env.NCP_ACCESS_KEY,
        secretAccessKey: process.env.NCP_SECRET_KEY,
      },
      endpoint: process.env.NCP_ENDPOINT,
      forcePathStyle: true,
    });

    // 파일명 생성 (타임스탬프 + 랜덤)
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(7);
    const ext = file.name.split('.').pop();
    const filename = `blog/${timestamp}-${random}.${ext}`;

    // 파일을 Buffer로 변환
    const buffer = Buffer.from(await file.arrayBuffer());

    // NCP에 업로드
    const uploadCommand = new PutObjectCommand({
      Bucket: process.env.NCP_BUCKET_NAME,
      Key: filename,
      Body: buffer,
      ContentType: file.type,
      ACL: 'public-read', // 공개 읽기 권한
    });

    await s3Client.send(uploadCommand);

    // 업로드된 파일 URL
    const url = `${process.env.NCP_ENDPOINT}/${process.env.NCP_BUCKET_NAME}/${filename}`;

    return NextResponse.json({ 
      success: true,
      url,
      filename 
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: '업로드 실패: ' + error.message },
      { status: 500 }
    );
  }
}

// 파일 크기 제한 설정
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};
