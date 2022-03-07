<template>
  <div v-if="activeCrossSells.length" class="mt-12">
    <h2 class="text-lg font-medium text-gray-900">
      <span v-if="!cart.lineItems.length">
        Add something to your cart
      </span>
      <span v-else-if="cart.lineItems.length && content.heading">
        {{ content.heading }}
      </span>
      <span v-else>
        You might also like
      </span>
    </h2>
    <ul>
      <li v-for="item in activeCrossSells" :key="item.id" class="py-6 flex">
        <div
          class="flex-shrink-0 w-24 h-24 border border-gray-200 rounded-md overflow-hidden"
        >
          <nuxt-img
            :src="item.variants[0].featuredMedia.src"
            :alt="item.variants[0].featuredMedia.alt"
            class="w-full h-full object-center object-cover"
          />
        </div>

        <div class="ml-4 flex-1 flex flex-col">
          <div>
            <div
              class="flex justify-between text-base font-medium text-gray-900"
            >
              <h3>
                <nuxt-link :to="`/products/${item.handle}`">
                  {{ item.title }}
                </nuxt-link>
              </h3>
              <p class="ml-4">
                <price
                  :price="item.variants[0].price"
                  :currencyCode="item.priceRange.currencyCode"
                  :locale="item.locale"
                />
              </p>
            </div>
          </div>
          <div class="flex-1 flex items-end text-sm">
            <div class="flex w-full">
              <button
                type="button"
                @click="addProduct(item)"
                class="relative flex bg-gray-100 border border-transparent rounded-md py-2 px-8 items-center justify-center text-sm font-medium text-gray-900 hover:bg-gray-200 w-full"
              >
                {{ content.add }}<span class="sr-only">, {{ item.title }}</span>
              </button>
            </div>
          </div>
        </div>
      </li>
    </ul>
  </div>
</template>

<script>
import { useSpaceProvider, useCartProvider } from "@nacelle/vue";
import { ref, inject, computed, useFetch, useStore } from "@nuxtjs/composition-api";
import Price from "~/components/core/Price.vue";

export default {
  name: "CartCrossSells",
  components: {
    Price
  },
  setup() {
    const { nacelleSdk } = useSpaceProvider();
    const { cart, addItem } = useCartProvider();
    const crossSells = ref([]);
    const store = useStore();
    const content = inject("crosssells");
    const isCheckingOut = inject("isCheckingOut");

    const addProduct = product => {
      // check if a preferred variant is stored
      let productVariant
      if (store.state.sizePreference.size) {
        // cycle through variants to find the one that matches the size
        product.variants.forEach(variant => {
          if (variant.title === store.state.sizePreference.size) {
            productVariant = variant
          }
        })
      }
      if (!productVariant) {
        productVariant = product.variants[0];
      }
      if (!isCheckingOut.value) {
        addItem({ product, variant: productVariant, quantity: 1 });
      }
    };

    const activeCrossSells = computed(() => {
      return crossSells.value
        .filter(crossSell => {
          return (
            crossSell.availableForSale &&
            !cart.lineItems.some(lineItem => {
              return lineItem.product.id === crossSell.id;
            })
          );
        })
        .slice(0, 3);
    });

    useFetch(async () => {
      crossSells.value = await nacelleSdk.data.products({
        handles: content.products
      });
    });

    return { cart, content, addProduct, crossSells, activeCrossSells };
  }
};
</script>
