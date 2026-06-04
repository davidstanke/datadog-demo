export interface Product {
  id: string;
  name: string;
  category: 'woodland' | 'ocean' | 'domestic' | 'jungle';
  price: number;
  description: string;
  image: string;
  tag?: string;
  isBestSeller?: boolean;
}

export const PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Barnaby the Bear',
    category: 'woodland',
    price: 18.50,
    description: 'A cozy polymer clay brown bear nestled happily on a soft, miniature moss bed. Includes a hand-woven tiny scarf.',
    image: '/images/bear.png',
    tag: 'Best Seller',
    isBestSeller: true
  },
  {
    id: '2',
    name: 'Pip the Piglet',
    category: 'domestic',
    price: 16.00,
    description: 'An incredibly chubby, smiling pink piglet with rosy cheeks. Pip wears a custom tiny pastel knit scarf.',
    image: '/images/piglet.png',
    tag: 'New Release'
  },
  {
    id: '3',
    name: 'Milo the Fox',
    category: 'woodland',
    price: 19.50,
    description: 'A sleeping orange fox curled into an adorable circle inside a tiny grass nest. Captures the peaceful nature of polymer clay.',
    image: '/images/fox.png',
    isBestSeller: true
  },
  {
    id: '4',
    name: 'Luna the Octopus',
    category: 'ocean',
    price: 15.00,
    description: 'A friendly lavender octopus with glossy black eyes and a hand-detailed texture. Luna comes with a tiny knitted scarf.',
    image: '/images/octopus.png',
    tag: 'Customer Favorite'
  },
  {
    id: '5',
    name: 'Daisy the Sheep',
    category: 'domestic',
    price: 17.50,
    description: 'A wonderfully textured white sheep with tiny black clay legs. Features a gorgeous curly swirl pattern for realistic wool.',
    image: '/images/sheep.png'
  },
  {
    id: '6',
    name: 'Silo the Sloth',
    category: 'jungle',
    price: 18.00,
    description: 'A happy, slow-living grey sloth hugging a little mossy branch. Silo is wearing a cozy earth-tone woolen scarf.',
    image: '/images/sloth.png',
    tag: 'Limited Edition'
  }
];
