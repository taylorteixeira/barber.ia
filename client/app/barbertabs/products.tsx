import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  Image,
} from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import {
  Plus,
  Edit,
  Trash2,
  Search,
  Package,
  DollarSign,
  ArrowLeft,
  Save,
  X,
} from 'lucide-react-native';
import { styles } from './products-styles';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  brand: string;
  category: string;
  image?: string;
}

export default function ProductsManagement() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([
    {
      id: '1',
      name: 'Pomada para Cabelo',
      description: 'Pomada modeladora efeito molhado',
      price: 35.9,
      stock: 12,
      brand: 'BarberShop Pro',
      category: 'Cabelo',
      image:
        'https://images.pexels.com/photos/3738347/pexels-photo-3738347.jpeg',
    },
    {
      id: '2',
      name: 'Óleo para Barba',
      description: 'Óleo hidratante para barba',
      price: 28.5,
      stock: 8,
      brand: 'BeardCare',
      category: 'Barba',
      image:
        'https://images.pexels.com/photos/4041392/pexels-photo-4041392.jpeg',
    },
    {
      id: '3',
      name: 'Shampoo Masculino',
      description: 'Shampoo anticaspa masculino',
      price: 22.9,
      stock: 15,
      brand: 'MenCare',
      category: 'Cabelo',
    },
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    brand: '',
    category: '',
    image: '',
  });

  const categories = ['Cabelo', 'Barba', 'Pele', 'Ferramentas', 'Outros'];

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openAddModal = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      stock: '',
      brand: '',
      category: 'Cabelo',
      image: '',
    });
    setModalVisible(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      stock: product.stock.toString(),
      brand: product.brand,
      category: product.category,
      image: product.image || '',
    });
    setModalVisible(true);
  };

  const handleSave = () => {
    if (
      !formData.name ||
      !formData.price ||
      !formData.stock ||
      !formData.brand
    ) {
      Alert.alert('Erro', 'Preencha todos os campos obrigatórios');
      return;
    }

    const productData: Product = {
      id: editingProduct?.id || Date.now().toString(),
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price),
      stock: parseInt(formData.stock),
      brand: formData.brand,
      category: formData.category,
      image: formData.image || undefined,
    };

    if (editingProduct) {
      setProducts(
        products.map((p) => (p.id === editingProduct.id ? productData : p))
      );
    } else {
      setProducts([...products, productData]);
    }

    setModalVisible(false);
    Alert.alert(
      'Sucesso',
      editingProduct ? 'Produto atualizado!' : 'Produto adicionado!'
    );
  };

  const handleDelete = (product: Product) => {
    Alert.alert(
      'Confirmar Exclusão',
      `Deseja excluir o produto "${product.name}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => {
            setProducts(products.filter((p) => p.id !== product.id));
            Alert.alert('Sucesso', 'Produto excluído!');
          },
        },
      ]
    );
  };

  const updateStock = (product: Product, newStock: number) => {
    if (newStock < 0) return;

    setProducts(
      products.map((p) => (p.id === product.id ? { ...p, stock: newStock } : p))
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <ArrowLeft size={24} color="#374151" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Meus Produtos</Text>
        <TouchableOpacity onPress={openAddModal} style={styles.addButton}>
          <Plus size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <Search size={20} color="#6B7280" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar produtos..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <ScrollView
        style={styles.productsList}
        showsVerticalScrollIndicator={false}
      >
        {filteredProducts.map((product) => (
          <View key={product.id} style={styles.productCard}>
            <View style={styles.productImage}>
              {product.image ? (
                <Image source={{ uri: product.image }} style={styles.image} />
              ) : (
                <View style={styles.imagePlaceholder}>
                  <Package size={24} color="#9CA3AF" />
                </View>
              )}
            </View>

            <View style={styles.productInfo}>
              <View style={styles.productHeader}>
                <Text style={styles.productName}>{product.name}</Text>
                <View
                  style={[
                    styles.stockBadge,
                    product.stock <= 5 && styles.stockBadgeLow,
                  ]}
                >
                  <Text
                    style={[
                      styles.stockText,
                      product.stock <= 5 && styles.stockTextLow,
                    ]}
                  >
                    {product.stock} un.
                  </Text>
                </View>
              </View>

              <Text style={styles.productBrand}>{product.brand}</Text>

              {product.description ? (
                <Text style={styles.productDescription}>
                  {product.description}
                </Text>
              ) : null}

              <View style={styles.productDetails}>
                <View style={styles.detailItem}>
                  <DollarSign size={16} color="#10B981" />
                  <Text style={styles.priceText}>
                    R$ {product.price.toFixed(2)}
                  </Text>
                </View>
                <View style={styles.categoryBadge}>
                  <Text style={styles.categoryText}>{product.category}</Text>
                </View>
              </View>

              <View style={styles.stockControls}>
                <Text style={styles.stockLabel}>Estoque:</Text>
                <View style={styles.stockButtons}>
                  <TouchableOpacity
                    onPress={() => updateStock(product, product.stock - 1)}
                    style={styles.stockButton}
                  >
                    <Text style={styles.stockButtonText}>-</Text>
                  </TouchableOpacity>
                  <Text style={styles.stockValue}>{product.stock}</Text>
                  <TouchableOpacity
                    onPress={() => updateStock(product, product.stock + 1)}
                    style={styles.stockButton}
                  >
                    <Text style={styles.stockButtonText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            <View style={styles.productActions}>
              <TouchableOpacity
                onPress={() => openEditModal(product)}
                style={[styles.actionButton, styles.editButton]}
              >
                <Edit size={16} color="#3B82F6" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleDelete(product)}
                style={[styles.actionButton, styles.deleteButton]}
              >
                <Trash2 size={16} color="#EF4444" />
              </TouchableOpacity>
            </View>
          </View>
        ))}

        {filteredProducts.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>Nenhum produto encontrado</Text>
            <TouchableOpacity onPress={openAddModal} style={styles.emptyButton}>
              <Text style={styles.emptyButtonText}>
                Adicionar Primeiro Produto
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <X size={24} color="#374151" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              {editingProduct ? 'Editar Produto' : 'Novo Produto'}
            </Text>
            <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
              <Save size={20} color="#FFFFFF" />
              <Text style={styles.saveButtonText}>Salvar</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Nome do Produto *</Text>
              <TextInput
                style={styles.input}
                value={formData.name}
                onChangeText={(text) =>
                  setFormData({ ...formData, name: text })
                }
                placeholder="Ex: Pomada para Cabelo"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Marca *</Text>
              <TextInput
                style={styles.input}
                value={formData.brand}
                onChangeText={(text) =>
                  setFormData({ ...formData, brand: text })
                }
                placeholder="Ex: BarberShop Pro"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Descrição</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.description}
                onChangeText={(text) =>
                  setFormData({ ...formData, description: text })
                }
                placeholder="Descrição do produto..."
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.formRow}>
              <View style={[styles.formGroup, styles.halfWidth]}>
                <Text style={styles.label}>Preço (R$) *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.price}
                  onChangeText={(text) =>
                    setFormData({ ...formData, price: text })
                  }
                  placeholder="0,00"
                  keyboardType="numeric"
                />
              </View>

              <View style={[styles.formGroup, styles.halfWidth]}>
                <Text style={styles.label}>Estoque *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.stock}
                  onChangeText={(text) =>
                    setFormData({ ...formData, stock: text })
                  }
                  placeholder="0"
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>URL da Imagem</Text>
              <TextInput
                style={styles.input}
                value={formData.image}
                onChangeText={(text) =>
                  setFormData({ ...formData, image: text })
                }
                placeholder="https://exemplo.com/imagem.jpg"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Categoria</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.categorySelector}
              >
                {categories.map((category) => (
                  <TouchableOpacity
                    key={category}
                    onPress={() => setFormData({ ...formData, category })}
                    style={[
                      styles.categoryOption,
                      formData.category === category &&
                        styles.categoryOptionSelected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.categoryOptionText,
                        formData.category === category &&
                          styles.categoryOptionTextSelected,
                      ]}
                    >
                      {category}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}
