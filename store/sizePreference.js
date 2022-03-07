export const state = () => {
  return {
    size: '',
  }
}

export const mutations = {
  setSize(state, size) {
    state.size = size
  },
}
