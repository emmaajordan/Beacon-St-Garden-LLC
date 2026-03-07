/*schema stuff goes here*/
create table products (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text,
  price numeric(10, 2),
  category text check (category in ('Vegetables', 'Flowers', 'Plants')),
  types text[],
  sunlight text,
  water text,
  soil text,
  care_notes text,
  availability text default 'Ready Now' check (availability in ('Ready Now', 'Coming Soon')),
  image_url text,
  stock integer default 0,
  showing boolean default true,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);