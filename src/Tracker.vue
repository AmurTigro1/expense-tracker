<script setup>
import { collection, onSnapshot, addDoc, deleteDoc, setDoc, doc } from 'firebase/firestore';
import db from './firebase/config.js';
import {onMounted, ref} from 'vue';
import { computed } from 'vue';

const expenses = ref([]);
const category = ref('')
const item = ref('')
const amount = ref('')
const isEditing = ref(false)
const editId = ref(null);

const btnText = computed(() => {
   return isEditing.value ? 'Save Expense' : 'Add Expense';
});

const getExpenses = async () => {
   onSnapshot(collection(db, 'expense-tracker'), (querySnap) => {
      const tmp = []
      querySnap.forEach((doc) => {
         const expense = {
            id: doc.id,
            data: doc.data()
         }
         tmp.push(expense)
      })
      expenses.value = tmp

      expenses.value.sort((a,b) => a.data.datetime - b.data.datetime)

   })
}


const addExpense = async () => {
   if (!item.value.trim() || !category.value.trim() || !amount.value.toString().trim()) {
      alert('Fields cannot be empty');
      return;
   }

   const data = {
      datetime: new Date(),
      category: category.value,
      item: item.value,
      amount: amount.value
   }

   if (isEditing.value) {
      await updateExpense(editId.value, data);
   } else {
      await addDoc(collection(db, 'expense-tracker'), data);
   }

   category.value = '';
   item.value = '';
   amount.value = '';
   isEditing.value = false;
   editId.value = null;
}

const date = (timestamp) => {
   if (!timestamp || !timestamp.seconds) {
        return 'Invalid Date';
    }

    const milliseconds = timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000;
    const date = new Date(milliseconds);
    return date.toLocaleString(); 
}

const onEdit = async(id) => {

const expense = expenses.value.find(expense => expense.id === id);

category.value = expense.data.category
item.value = expense.data.item
amount.value = expense.data.amount
isEditing.value = true;
editId.value = id;

}

const onDelete = async(id) => {
   const confirmDelete = confirm("Are you sure you want to delete this expense?")
   if(confirmDelete) {
      await deleteDoc(doc(db, 'expense-tracker', id))
      expenses.value = expenses.value.filter(expense => expense.id !==id)
   }
}

const updateExpense = async (id, data) => {
   await setDoc(doc(db, 'expense-tracker', id), data);
}


const totalExp = computed(() => {
  return expenses.value.reduce((total, expense) => total + expense.data.amount, 0);
});


onMounted(()=>{
   getExpenses()
})
</script>

<template>
  <div class="border border-green-300 mt-24 shadow-2xl">
<div class="container mx-auto py-10 shadow-2xl">
  <h1 class="text-4xl font-bold text-center mb-8">Expense Tracker</h1>
  <div class="flex">
    <div class="w-1/2 mr-5 ml-4">
      <div class="bg-white shadow-md rounded-lg p-4 w-69">
        <form @submit.prevent="addExpense">
          <div class="grid grid-cols-1 gap-4">
            <div>
              <label for="category" class="block text-gray-700 font-bold mb-2">Category:</label>
              <select v-model="category" class="block w-full border border-gray-400 text-gray-700 py-3 px-4 pr-8 rounded leading-tight focus:bg-white focus:border-gray-500">
                <option value="Food">Food</option>
                <option value="Appliances">Appliances</option>
                <option value="Game">Game</option>
                <option value="Electronics">Electronics</option>
                <option value="Beverages">Beverages</option>
              </select>
            </div>
            <div>
              <label for="item" class="block text-gray-700 font-bold mb-2">Item:</label>
              <input type="text" v-model="item" class="appearance-none border border border-gray-400 rounded w-full py-3 px-4 leading-tight focus:shadow-outline">
            </div>
            <div>
              <label for="amount" class="block text-gray-700 font-bold mb-2">Amount:</label>
              <input type="number" v-model="amount" class="appearance-none border border border-gray-400 rounded w-full py-3 px-4 leading-tight focus:shadow-outline">
            </div>
            <div>
              <button type="submit" class="bg-green-300 hover:bg-green-500 text-white-700 font-bold py-2 px-4 rounded focus:shadow-outline">{{ btnText }}</button>
            </div>
          </div>
        </form>
      </div>
    </div>
    <div class="right">
  <div class="w-1/1 mr-4 h-[45vh]">
    <div class="bg-white shadow-md rounded-lg p-6 overflow-x-auto relative h-full max-h-150">
      <table class="w-auto h-full overflow-y-auto">
        <thead>
          <tr>
            <th class="px-4 py-2">Date & Time</th>
            <th class="px-4 py-2">Category</th>
            <th class="px-4 py-2">Item</th>
            <th class="px-4 py-2">Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="expense in expenses" :key="expense.id">
            <td class="border px-10 py-2">{{ date(expense.data.datetime) }}</td>
            <td class="border px-10 py-2">{{ expense.data.category }}</td>
            <td class="border px-10 py-2">{{ expense.data.item }}</td>
            <td class="border px-10 py-2">{{ expense.data.amount }}</td>
            <td class="border px-10 py-2 flex gap-5">
              <button @click="onEdit(expense.id)" class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-pencil-square" viewBox="0 0 16 16">
  <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z"/>
  <path fill-rule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5z"/>
</svg></button>
              <button @click="onDelete(expense.id)" class="bg-red-600 hover:bg-red-800 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trash3" viewBox="0 0 16 16">
  <path d="M6.5 1h3a.5.5 0 0 1 .5.5v1H6v-1a.5.5 0 0 1 .5-.5M11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3A1.5 1.5 0 0 0 5 1.5v1H1.5a.5.5 0 0 0 0 1h.538l.853 10.66A2 2 0 0 0 4.885 16h6.23a2 2 0 0 0 1.994-1.84l.853-10.66h.538a.5.5 0 0 0 0-1zm1.958 1-.846 10.58a1 1 0 0 1-.997.92h-6.23a1 1 0 0 1-.997-.92L3.042 3.5zm-7.487 1a.5.5 0 0 1 .528.47l.5 8.5a.5.5 0 0 1-.998.06L5 5.03a.5.5 0 0 1 .47-.53Zm5.058 0a.5.5 0 0 1 .47.53l-.5 8.5a.5.5 0 1 1-.998-.06l.5-8.5a.5.5 0 0 1 .528-.47M8 4.5a.5.5 0 0 1 .5.5v8.5a.5.5 0 0 1-1 0V5a.5.5 0 0 1 .5-.5"/>
</svg></button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <tfoot class="bottom-0">
          <tr>
            <th scope="row" class="px-4 py-2 text-2xl sticky-footer text-right">Total Expenses: ₱ {{ totalExp }}</th>
          </tr>
        </tfoot>
  </div>
</div>
   </div>
   </div>
  </div>
</template>
<style>
  .sticky-footer {
    position: sticky;
    bottom: 0;
  }
</style>