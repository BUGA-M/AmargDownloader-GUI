export interface VideoMultiDwl {
  id: string;
  url: string;
  video_name: string;
  format?: string;
}

export class VideoMultiDwlQueue {
  private list: VideoMultiDwl[] = [];

  push(url: string, video_name: string, id : string, format?: string): VideoMultiDwl {
    const item: VideoMultiDwl = {
      id,
      url,
      video_name,
      format
    };
    this.list.push(item);
    return item;
  }

  remove(id: string): boolean {
    const idx = this.list.findIndex(v => v.id === id);
    if (idx === -1) return false;
    this.list.splice(idx, 1);
    return true;
  }

  clear(): void {
    this.list = [];
  }

  get videos(): readonly VideoMultiDwl[] {
    return this.list;
  }

  /** Pour l’app front (avec id) */
  toArray(): VideoMultiDwl[] {
    return [...this.list];
  }

  /** Pour Rust (sans id) */
  toArrayForRust(): { url: string; video_name: string; format?: string }[] {
    return this.list.map(v => ({
      url: v.url,
      video_name: v.video_name,
      format: v.format,
    }));
  }

}
