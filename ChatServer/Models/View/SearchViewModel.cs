namespace ChatServer.Models.View
{
    public enum SearchObjectType { User = 0, Storage = 1 }
    public class SearchViewModel
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string UniqueName { get; set; }
        public string ImgContent { get; set; }
        public SearchObjectType Type { get; set; }
    }
}
