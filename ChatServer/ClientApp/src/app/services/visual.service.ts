export class VisualService{
  public get innerWidth(): number{
    return window.innerWidth;
  }
  public get IsMobile(): boolean{
    return window.innerWidth <= 768;
  }
}
