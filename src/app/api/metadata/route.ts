import { NextRequest, NextResponse } from "next/server";
import { MetadataService } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Get all metadata from Supabase
    const allMetadata = await MetadataService.getAllMetadata();
    
    // Apply pagination
    const paginatedData = allMetadata.slice(offset, offset + limit);
    
    return NextResponse.json({
      success: true,
      data: paginatedData,
      total: allMetadata.length,
      limit,
      offset,
      hasMore: offset + limit < allMetadata.length
    });
  } catch (error) {
    console.error("Error fetching all metadata:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch metadata" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tokenId = searchParams.get('tokenId');
    
    if (!tokenId) {
      return NextResponse.json(
        { success: false, error: "Token ID is required" },
        { status: 400 }
      );
    }

    const deleted = await MetadataService.deleteMetadata(tokenId);
    
    if (deleted) {
      return NextResponse.json({
        success: true,
        message: `Metadata for token ${tokenId} deleted successfully`
      });
    } else {
      return NextResponse.json(
        { success: false, error: "Failed to delete metadata" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error deleting metadata:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete metadata" },
      { status: 500 }
    );
  }
} 