import { Search, HelpCircle, Book, MessageCircle, Users, Zap, Bot, Shield } from 'lucide-react';
import { contextHelpService, HelpContent } from '@/services/context_help_service';
import { useAuth } from '@/contexts/AuthContext';
import AuthGuard from '@/components/auth-guard';

export default function HelpPage() {
  const { t } = useTranslation('help');
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredContent, setFilteredContent] = useState<HelpContent[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    const content = contextHelpService.getHelpContent();
    const filtered = content.filter(item => {
      const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.content.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
    setFilteredContent(filtered);
  }, [searchTerm, selectedCategory]);

  const categories = [
    { id: 'all', label: t('categories.all'), icon: Book },
    { id: 'getting-started', label: t('categories.gettingStarted'), icon: Zap },
    { id: 'features', label: t('categories.features'), icon: Bot },
    { id: 'account', label: t('categories.account'), icon: Users },
    { id: 'security', label: t('categories.security'), icon: Shield },
    { id: 'support', label: t('categories.support'), icon: MessageCircle },
  ];

  return (
    <AuthGuard>
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-4 flex items-center justify-center gap-3">
            <HelpCircle className="h-10 w-10 text-primary" />
            {t('title')}
          </h1>
          <p className="text-xl text-muted-foreground">{t('subtitle')}</p>
        </div>

        <div className="mb-8 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder={t('searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category.id)}
                  className="flex items-center gap-2"
                >
                  <Icon className="h-4 w-4" />
                  {category.label}
                </Button>
              );
            })}
          </div>
        </div>

        <div className="space-y-4">
          {filteredContent.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <HelpCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">{t('noResults.title')}</h3>
                <p className="text-muted-foreground">{t('noResults.description')}</p>
              </CardContent>
            </Card>
          ) : (
            filteredContent.map((item) => (
              <Card key={item.id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {getCategoryIcon(item.category)}
                    {item.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm max-w-none">
                    {item.content.split('\n').map((paragraph, index) => (
                      <p key={index} className="mb-2 last:mb-0">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              {t('contact.title')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">{t('contact.description')}</p>
            <Button asChild>
              <a href="mailto:support@example.com">
                {t('contact.button')}
              </a>
            </Button>
          </CardContent>
        </Card>
      </div>
    </AuthGuard>
  );
}