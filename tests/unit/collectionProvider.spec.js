import { mount } from '@vue/test-utils'
import sdk from '@nacelle/client-js-sdk'
import CollectionProvider from '~/providers/CollectionProvider'
import collectionData from '~/utils/collectionData'

jest.mock('@nacelle/client-js-sdk')

const InjectedComponent = () => {
  return {
    name: 'InjectedComponent',
    inject: [
      'collections',
      'addCollections',
      'removeCollections',
      'getCollections',
      'loadCollectionProducts'
    ],
    template: `<div></div>`
  }
}

const WrapperComponent = ({ props = {} } = {}) => ({
  render: (h) => h(CollectionProvider, { props }, [h(InjectedComponent())])
})

describe('Collection Provider', () => {
  it('provides `collections`, `addCollections`, `removeCollections`, `getCollections` and `loadCollectionProducts` to children', () => {
    const collectionProvider = mount(WrapperComponent())
    const injectedComponent = collectionProvider.findComponent({
      name: 'InjectedComponent'
    })
    expect(Array.isArray(injectedComponent.vm.collections.value)).toBe(true)
    expect(typeof injectedComponent.vm.addCollections).toEqual('function')
    expect(typeof injectedComponent.vm.removeCollections).toEqual('function')
    expect(typeof injectedComponent.vm.getCollections).toEqual('function')
    expect(typeof injectedComponent.vm.loadCollectionProducts).toEqual(
      'function'
    )
  })

  it('initializes collections from props', () => {
    const collectionProvider = mount(
      WrapperComponent({ props: { collections: collectionData } })
    )
    const injectedComponent = collectionProvider.findComponent({
      name: 'InjectedComponent'
    })
    expect(injectedComponent.vm.collections.value.length).toBe(2)
  })

  it('calls addCollections function to append collections', () => {
    const collectionProvider = mount(
      WrapperComponent({ props: { collections: [collectionData[0]] } })
    )
    const injectedComponent = collectionProvider.findComponent({
      name: 'InjectedComponent'
    })
    jest.spyOn(injectedComponent.vm, 'addCollections')
    injectedComponent.vm.addCollections({ collections: [collectionData[1]] })
    expect(injectedComponent.vm.addCollections).toHaveBeenCalledTimes(1)
    expect(injectedComponent.vm.collections.value.length).toBe(2)
  })

  it('calls addCollections function to fetch & append collections', async () => {
    sdk.mockImplementation(() => ({
      data: {
        collection: () => Promise.resolve([collectionData[1]]),
        collectionPage: () => Promise.resolve([collectionData[1].products])
      }
    }))
    const collectionProvider = mount(
      WrapperComponent({ props: { collections: [collectionData[0]] } })
    )
    const injectedComponent = collectionProvider.findComponent({
      name: 'InjectedComponent'
    })
    jest.spyOn(injectedComponent.vm, 'addCollections')
    await injectedComponent.vm.addCollections({
      handles: [collectionData[1].handle]
    })
    expect(injectedComponent.vm.addCollections).toHaveBeenCalledTimes(1)
    expect(injectedComponent.vm.collections.value.length).toBe(2)
  })

  it('calls addCollections function to append collections w/o duplicates', () => {
    const collectionProvider = mount(
      WrapperComponent({ props: { collections: [collectionData[1]] } })
    )
    const injectedComponent = collectionProvider.findComponent({
      name: 'InjectedComponent'
    })
    jest.spyOn(injectedComponent.vm, 'addCollections')
    injectedComponent.vm.addCollections({ collections: [collectionData[1]] })
    expect(injectedComponent.vm.addCollections).toHaveBeenCalledTimes(1)
    expect(injectedComponent.vm.collections.value.length).toBe(1)
  })

  it('calls addCollections function to replace collections', () => {
    const collectionProvider = mount(
      WrapperComponent({ props: { collections: [collectionData[0]] } })
    )
    const injectedComponent = collectionProvider.findComponent({
      name: 'InjectedComponent'
    })
    jest.spyOn(injectedComponent.vm, 'addCollections')
    injectedComponent.vm.addCollections({
      collections: [collectionData[1]],
      method: 'replace'
    })
    expect(injectedComponent.vm.addCollections).toHaveBeenCalledTimes(1)
    expect(injectedComponent.vm.collections.value.length).toBe(1)
  })

  it('calls removeCollections function to remove collections', () => {
    const collectionProvider = mount(
      WrapperComponent({ props: { collections: collectionData } })
    )
    const injectedComponent = collectionProvider.findComponent({
      name: 'InjectedComponent'
    })
    jest.spyOn(injectedComponent.vm, 'removeCollections')
    injectedComponent.vm.removeCollections({
      handles: [collectionData[1].handle]
    })
    expect(injectedComponent.vm.removeCollections).toHaveBeenCalledTimes(1)
    expect(injectedComponent.vm.collections.value.length).toBe(1)
  })

  it('calls removeCollectinos function to clear collections', () => {
    const collectionProvider = mount(
      WrapperComponent({ props: { collections: collectionData } })
    )
    const injectedComponent = collectionProvider.findComponent({
      name: 'InjectedComponent'
    })
    jest.spyOn(injectedComponent.vm, 'removeCollections')
    injectedComponent.vm.removeCollections({ handles: null })
    expect(injectedComponent.vm.removeCollections).toHaveBeenCalledTimes(1)
    expect(injectedComponent.vm.collections.value.length).toBe(0)
  })

  it('calls getCollections function to return collection by handle', () => {
    const collectionProvider = mount(
      WrapperComponent({ props: { collections: collectionData } })
    )
    const injectedComponent = collectionProvider.findComponent({
      name: 'InjectedComponent'
    })
    jest.spyOn(injectedComponent.vm, 'getCollections')
    const shirts = injectedComponent.vm.getCollections({
      handles: ['shirts']
    })
    const shirtsAndHats = injectedComponent.vm.getCollections({
      handles: ['shirts', 'hats']
    })
    const allProducts = injectedComponent.vm.getCollections({
      handles: null
    })
    expect(shirts.length).toBe(1)
    expect(shirts[0].handle).toBe('shirts')
    expect(shirtsAndHats.length).toBe(2)
    expect(shirtsAndHats[1].handle).toBe('hats')
    expect(allProducts.length).toBe(2)
    expect(injectedComponent.vm.getCollections).toHaveBeenCalledTimes(3)
  })

  it('calls loadCollectionProducts function to add collection products', async () => {
    sdk.mockImplementation(() => ({
      data: {
        products: () =>
          Promise.resolve([{ products: collectionData[0].products }])
      }
    }))
    const collectionProvider = mount(
      WrapperComponent({
        props: {
          collections: [
            {
              handle: collectionData[0].handle,
              productLists: collectionData[0].productLists,
              products: []
            }
          ]
        }
      })
    )
    const injectedComponent = collectionProvider.findComponent({
      name: 'InjectedComponent'
    })
    jest.spyOn(injectedComponent.vm, 'loadCollectionProducts')
    await injectedComponent.vm.loadCollectionProducts({
      handle: collectionData[0].handle
    })
    expect(injectedComponent.vm.loadCollectionProducts).toHaveBeenCalledTimes(1)
    expect(injectedComponent.vm.collections.value[0].products.length).toBe(1)
  })
})
