import datetime
from database.mongodb import db

questions_collection = db["coding_questions"]

DSA_QUESTIONS = [
    {
        "title": "Two Sum",
        "category": "Arrays",
        "difficulty": "Easy",
        "description": "Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`. Assume each input has exactly one solution.",
        "templates": {
            "python": "def two_sum(nums, target):\n    # Write your solution here\n    pass",
            "javascript": "function twoSum(nums, target) {\n    // Write your solution here\n}",
            "java": "public class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        // Write your solution here\n        return new int[]{};\n    }\n}",
            "cpp": "class Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        // Write your solution here\n        return {};\n    }\n};",
            "c": "int* twoSum(int* nums, int numsSize, int target, int* returnSize) {\n    // Write your solution here\n    return NULL;\n}"
        },
        "test_cases": [
            {"input": "[2, 7, 11, 15], target = 9", "expected": "[0, 1]"},
            {"input": "[3, 2, 4], target = 6", "expected": "[1, 2]"}
        ]
    },
    {
        "title": "Valid Palindrome",
        "category": "Strings",
        "difficulty": "Easy",
        "description": "Given a string `s`, return `true` if it is a palindrome, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters.",
        "templates": {
            "python": "def is_palindrome(s):\n    # Write your solution here\n    pass",
            "javascript": "function isPalindrome(s) {\n    // Write your solution here\n}",
            "java": "public class Solution {\n    public boolean isPalindrome(String s) {\n        // Write your solution here\n        return false;\n    }\n}",
            "cpp": "class Solution {\npublic:\n    bool isPalindrome(string s) {\n        // Write your solution here\n        return false;\n    }\n};",
            "c": "bool isPalindrome(char* s) {\n    // Write your solution here\n    return false;\n}"
        },
        "test_cases": [
            {"input": "\"A man, a plan, a canal: Panama\"", "expected": "true"},
            {"input": "\"race a car\"", "expected": "false"}
        ]
    },
    {
        "title": "Reverse Linked List",
        "category": "Linked Lists",
        "difficulty": "Medium",
        "description": "Given the head of a singly linked list, reverse the list, and return the reversed list.",
        "templates": {
            "python": "def reverse_list(head):\n    # Write your solution here\n    pass",
            "javascript": "function reverseList(head) {\n    // Write your solution here\n}",
            "java": "public class Solution {\n    public ListNode reverseList(ListNode head) {\n        // Write your solution here\n        return null;\n    }\n}",
            "cpp": "class Solution {\npublic:\n    ListNode* reverseList(ListNode* head) {\n        // Write your solution here\n        return nullptr;\n    }\n};",
            "c": "struct ListNode* reverseList(struct ListNode* head) {\n    // Write your solution here\n    return NULL;\n}"
        },
        "test_cases": [
            {"input": "[1, 2, 3, 4, 5]", "expected": "[5, 4, 3, 2, 1]"}
        ]
    },
    {
        "title": "Invert Binary Tree",
        "category": "Trees",
        "difficulty": "Easy",
        "description": "Given the root of a binary tree, invert the tree (mirror structure) and return its root.",
        "templates": {
            "python": "def invert_tree(root):\n    # Write your solution here\n    pass",
            "javascript": "function invertTree(root) {\n    // Write your solution here\n}",
            "java": "public class Solution {\n    public TreeNode invertTree(TreeNode root) {\n        // Write your solution here\n        return null;\n    }\n}",
            "cpp": "class Solution {\npublic:\n    TreeNode* invertTree(TreeNode* root) {\n        // Write your solution here\n        return nullptr;\n    }\n};",
            "c": "struct TreeNode* invertTree(struct TreeNode* root) {\n    // Write your solution here\n    return NULL;\n}"
        },
        "test_cases": [
            {"input": "[4, 2, 7, 1, 3, 6, 9]", "expected": "[4, 7, 2, 9, 6, 3, 1]"}
        ]
    },
    {
        "title": "Find Path in Graph",
        "category": "Graphs",
        "difficulty": "Medium",
        "description": "Determine if there is a valid path from a source node to a destination node in an undirected graph.",
        "templates": {
            "python": "def valid_path(n, edges, source, destination):\n    # Write your solution here\n    pass",
            "javascript": "function validPath(n, edges, source, destination) {\n    // Write your solution here\n}",
            "java": "public class Solution {\n    public boolean validPath(int n, int[][] edges, int source, int destination) {\n        // Write your solution here\n        return false;\n    }\n}",
            "cpp": "class Solution {\npublic:\n    bool validPath(int n, vector<vector<int>>& edges, int source, int destination) {\n        // Write your solution here\n        return false;\n    }\n};",
            "c": "bool validPath(int n, int** edges, int edgesSize, int* edgesColSize, int source, int destination) {\n    // Write your solution here\n    return false;\n}"
        },
        "test_cases": [
            {"input": "n = 3, edges = [[0,1],[1,2],[2,0]], source = 0, destination = 2", "expected": "true"}
        ]
    },
    {
        "title": "Climbing Stairs",
        "category": "Dynamic Programming",
        "difficulty": "Easy",
        "description": "You are climbing a staircase. It takes `n` steps to reach the top. Each time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?",
        "templates": {
            "python": "def climb_stairs(n):\n    # Write your solution here\n    pass",
            "javascript": "function climbStairs(n) {\n    // Write your solution here\n}",
            "java": "public class Solution {\n    public int climbStairs(int n) {\n        // Write your solution here\n        return 0;\n    }\n}",
            "cpp": "class Solution {\npublic:\n    int climbStairs(int n) {\n        // Write your solution here\n        return 0;\n    }\n};",
            "c": "int climbStairs(int n) {\n    // Write your solution here\n    return 0;\n}"
        },
        "test_cases": [
            {"input": "2", "expected": "2"},
            {"input": "3", "expected": "3"}
        ]
    },
    {
        "title": "N-th Fibonacci",
        "category": "Recursion",
        "difficulty": "Easy",
        "description": "Calculate the N-th Fibonacci number using a recursive approach.",
        "templates": {
            "python": "def fib(n):\n    # Write your solution here\n    pass",
            "javascript": "function fib(n) {\n    // Write your solution here\n}",
            "java": "public class Solution {\n    public int fib(int n) {\n        // Write your solution here\n        return 0;\n    }\n}",
            "cpp": "class Solution {\npublic:\n    int fib(int n) {\n        // Write your solution here\n        return 0;\n    }\n};",
            "c": "int fib(int n) {\n    // Write your solution here\n    return 0;\n}"
        },
        "test_cases": [
            {"input": "4", "expected": "3"},
            {"input": "9", "expected": "34"}
        ]
    },
    {
        "title": "Permutations",
        "category": "Backtracking",
        "difficulty": "Medium",
        "description": "Given an array `nums` of distinct integers, return all the possible permutations in any order.",
        "templates": {
            "python": "def permute(nums):\n    # Write your solution here\n    pass",
            "javascript": "function permute(nums) {\n    // Write your solution here\n}",
            "java": "public class Solution {\n    public List<List<Integer>> permute(int[] nums) {\n        // Write your solution here\n        return null;\n    }\n}",
            "cpp": "class Solution {\npublic:\n    vector<vector<int>> permute(vector<int>& nums) {\n        // Write your solution here\n        return {};\n    }\n};",
            "c": "int** permute(int* nums, int numsSize, int* returnSize, int** returnColumnSizes) {\n    // Write your solution here\n    return NULL;\n}"
        },
        "test_cases": [
            {"input": "[1,2,3]", "expected": "[[1,2,3],[1,3,2],[2,1,3],[2,3,1],[3,1,2],[3,2,1]]"}
        ]
    },
    {
        "title": "Activity Selection",
        "category": "Greedy",
        "difficulty": "Medium",
        "description": "Select the maximum number of activities that can be performed by a single person, assuming that a person can only work on a single activity at a time.",
        "templates": {
            "python": "def max_activities(start, finish):\n    # Write your solution here\n    pass",
            "javascript": "function maxActivities(start, finish) {\n    // Write your solution here\n}",
            "java": "public class Solution {\n    public int maxActivities(int[] start, int[] finish) {\n        // Write your solution here\n        return 0;\n    }\n}",
            "cpp": "class Solution {\npublic:\n    int maxActivities(vector<int>& start, vector<int>& finish) {\n        // Write your solution here\n        return 0;\n    }\n};",
            "c": "int maxActivities(int* start, int* finish, int n) {\n    // Write your solution here\n    return 0;\n}"
        },
        "test_cases": [
            {"input": "start = [1, 3, 0, 5, 8, 5], finish = [2, 4, 6, 7, 9, 9]", "expected": "4"}
        ]
    },
    {
        "title": "Search in Rotated Sorted Array",
        "category": "Binary Search",
        "difficulty": "Medium",
        "description": "Given a rotated sorted integer array `nums` and a `target` value, return its index if found. Otherwise, return -1. Solve it in O(log n) time.",
        "templates": {
            "python": "def search(nums, target):\n    # Write your solution here\n    pass",
            "javascript": "function search(nums, target) {\n    // Write your solution here\n}",
            "java": "public class Solution {\n    public int search(int[] nums, int target) {\n        // Write your solution here\n        return -1;\n    }\n}",
            "cpp": "class Solution {\npublic:\n    int search(vector<int>& nums, int target) {\n        // Write your solution here\n        return -1;\n    }\n};",
            "c": "int search(int* nums, int numsSize, int target) {\n    // Write your solution here\n    return -1;\n}"
        },
        "test_cases": [
            {"input": "nums = [4,5,6,7,0,1,2], target = 0", "expected": "4"},
            {"input": "nums = [4,5,6,7,0,1,2], target = 3", "expected": "-1"}
        ]
    },
    {
        "title": "Valid Parentheses",
        "category": "Stack",
        "difficulty": "Easy",
        "description": "Given a string `s` containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.",
        "templates": {
            "python": "def is_valid(s):\n    # Write your solution here\n    pass",
            "javascript": "function isValid(s) {\n    // Write your solution here\n}",
            "java": "public class Solution {\n    public boolean isValid(String s) {\n        // Write your solution here\n        return false;\n    }\n}",
            "cpp": "class Solution {\npublic:\n    bool isValid(string s) {\n        // Write your solution here\n        return false;\n    }\n};",
            "c": "bool isValid(char* s) {\n    // Write your solution here\n    return false;\n}"
        },
        "test_cases": [
            {"input": "\"()[]{}\"", "expected": "true"},
            {"input": "\"(]\"", "expected": "false"}
        ]
    },
    {
        "title": "Implement Queue using Stacks",
        "category": "Queue",
        "difficulty": "Easy",
        "description": "Implement a first in first out (FIFO) queue using only two stacks. The implemented queue should support all standard queue functions (`push`, `peek`, `pop`, and `empty`).",
        "templates": {
            "python": "class MyQueue:\n    def __init__(self):\n        pass\n    def push(self, x: int) -> None:\n        pass\n    def pop(self) -> int:\n        pass\n    def peek(self) -> int:\n        pass\n    def empty(self) -> bool:\n        pass",
            "javascript": "class MyQueue {\n    constructor() {}\n    push(x) {}\n    pop() {}\n    peek() {}\n    empty() {}\n}",
            "java": "class MyQueue {\n    public MyQueue() {}\n    public void push(int x) {}\n    public int pop() { return 0; }\n    public int peek() { return 0; }\n    public boolean empty() { return true; }\n}",
            "cpp": "class MyQueue {\npublic:\n    MyQueue() {}\n    void push(int x) {}\n    int pop() { return 0; }\n    int peek() { return 0; }\n    bool empty() { return true; }\n};",
            "c": "typedef struct {\n    \n} MyQueue;\nMyQueue* myQueueCreate() { return NULL; }\nvoid myQueuePush(MyQueue* obj, int x) {}\nint myQueuePop(MyQueue* obj) { return 0; }\nint myQueuePeek(MyQueue* obj) { return 0; }\nbool myQueueEmpty(MyQueue* obj) { return true; }"
        },
        "test_cases": [
            {"input": "[\"MyQueue\", \"push\", \"push\", \"peek\", \"pop\", \"empty\"], [[], [1], [2], [], [], []]", "expected": "[null, null, null, 1, 1, false]"}
        ]
    },
    {
        "title": "Kth Largest Element in an Array",
        "category": "Heap",
        "difficulty": "Medium",
        "description": "Given an integer array `nums` and an integer `k`, return the `k`th largest element in the array. Solve it in O(n log k) or O(n) complexity.",
        "templates": {
            "python": "def find_kth_largest(nums, k):\n    # Write your solution here\n    pass",
            "javascript": "function findKthLargest(nums, k) {\n    // Write your solution here\n}",
            "java": "public class Solution {\n    public int findKthLargest(int[] nums, int k) {\n        // Write your solution here\n        return 0;\n    }\n}",
            "cpp": "class Solution {\npublic:\n    int findKthLargest(vector<int>& nums, int k) {\n        // Write your solution here\n        return 0;\n    }\n};",
            "c": "int findKthLargest(int* nums, int numsSize, int k) {\n    // Write your solution here\n    return 0;\n}"
        },
        "test_cases": [
            {"input": "[3,2,1,5,6,4], k = 2", "expected": "5"}
        ]
    },
    {
        "title": "Implement Trie (Prefix Tree)",
        "category": "Trie",
        "difficulty": "Medium",
        "description": "A trie (pronounced as 'try') or prefix tree is a tree data structure used to efficiently store and retrieve keys in a dataset of strings. Implement functions: `insert`, `search`, and `startsWith`.",
        "templates": {
            "python": "class Trie:\n    def __init__(self):\n        pass\n    def insert(self, word: str) -> None:\n        pass\n    def search(self, word: str) -> bool:\n        pass\n    def starts_with(self, prefix: str) -> bool:\n        pass",
            "javascript": "class Trie {\n    constructor() {}\n    insert(word) {}\n    search(word) {}\n    startsWith(prefix) {}\n}",
            "java": "class Trie {\n    public Trie() {}\n    public void insert(String word) {}\n    public boolean search(String word) { return false; }\n    public boolean startsWith(String prefix) { return false; }\n}",
            "cpp": "class Trie {\npublic:\n    Trie() {}\n    void insert(string word) {}\n    bool search(string word) { return false; }\n    bool startsWith(string prefix) { return false; }\n};",
            "c": "typedef struct {\n    \n} Trie;\nTrie* trieCreate() { return NULL; }\nvoid trieInsert(Trie* obj, char* word) {}\nbool trieSearch(Trie* obj, char* word) { return false; }\nbool trieStartsWith(Trie* obj, char* prefix) { return false; }"
        },
        "test_cases": [
            {"input": "[\"Trie\", \"insert\", \"search\", \"startsWith\"], [[], [\"apple\"], [\"apple\"], [\"app\"]]", "expected": "[null, null, true, true]"}
        ]
    },
    {
        "title": "Fizz Buzz",
        "category": "Math",
        "difficulty": "Easy",
        "description": "Given an integer `n`, return a string array answer (1-indexed) where: `answer[i] == 'FizzBuzz'` if divisible by 3 and 5, `'Fizz'` if divisible by 3, `'Buzz'` if divisible by 5, or string of the index.",
        "templates": {
            "python": "def fizz_buzz(n):\n    # Write your solution here\n    pass",
            "javascript": "function fizzBuzz(n) {\n    // Write your solution here\n}",
            "java": "public class Solution {\n    public List<String> fizzBuzz(int n) {\n        // Write your solution here\n        return null;\n    }\n}",
            "cpp": "class Solution {\npublic:\n    vector<string> fizzBuzz(int n) {\n        // Write your solution here\n        return {};\n    }\n};",
            "c": "char** fizzBuzz(int n, int* returnSize) {\n    // Write your solution here\n    return NULL;\n}"
        },
        "test_cases": [
            {"input": "3", "expected": "[\"1\",\"2\",\"Fizz\"]"}
        ]
    },
    {
        "title": "Single Number",
        "category": "Bit Manipulation",
        "difficulty": "Easy",
        "description": "Given a non-empty array of integers `nums`, every element appears twice except for one. Find that single one. Implement it in O(n) time and O(1) space.",
        "templates": {
            "python": "def single_number(nums):\n    # Write your solution here\n    pass",
            "javascript": "function singleNumber(nums) {\n    // Write your solution here\n}",
            "java": "public class Solution {\n    public int singleNumber(int[] nums) {\n        // Write your solution here\n        return 0;\n    }\n}",
            "cpp": "class Solution {\npublic:\n    int singleNumber(vector<int>& nums) {\n        // Write your solution here\n        return 0;\n    }\n};",
            "c": "int singleNumber(int* nums, int numsSize) {\n    // Write your solution here\n    return 0;\n}"
        },
        "test_cases": [
            {"input": "[4, 1, 2, 1, 2]", "expected": "4"}
        ]
    },
    {
        "title": "Merge Sort",
        "category": "Sorting",
        "difficulty": "Medium",
        "description": "Sort an array of integers using the Merge Sort algorithm, ensuring O(n log n) efficiency.",
        "templates": {
            "python": "def merge_sort(nums):\n    # Write your solution here\n    pass",
            "javascript": "function mergeSort(nums) {\n    // Write your solution here\n}",
            "java": "public class Solution {\n    public int[] mergeSort(int[] nums) {\n        // Write your solution here\n        return nums;\n    }\n}",
            "cpp": "class Solution {\npublic:\n    vector<int> mergeSort(vector<int>& nums) {\n        // Write your solution here\n        return {};\n    }\n};",
            "c": "int* mergeSort(int* nums, int numsSize) {\n    // Write your solution here\n    return nums;\n}"
        },
        "test_cases": [
            {"input": "[5, 2, 3, 1]", "expected": "[1, 2, 3, 5]"}
        ]
    },
    {
        "title": "Linear Search",
        "category": "Searching",
        "difficulty": "Easy",
        "description": "Search for a target value in an array. Return the target's index if it is present; otherwise, return -1.",
        "templates": {
            "python": "def linear_search(nums, target):\n    # Write your solution here\n    pass",
            "javascript": "function linearSearch(nums, target) {\n    // Write your solution here\n}",
            "java": "public class Solution {\n    public int linearSearch(int[] nums, int target) {\n        // Write your solution here\n        return -1;\n    }\n}",
            "cpp": "class Solution {\npublic:\n    int linearSearch(vector<int>& nums, int target) {\n        // Write your solution here\n        return -1;\n    }\n};",
            "c": "int linearSearch(int* nums, int numsSize, int target) {\n    // Write your solution here\n    return -1;\n}"
        },
        "test_cases": [
            {"input": "nums = [1, 5, 8, 3], target = 8", "expected": "2"}
        ]
    }
]

def seed_coding_questions():
    try:
        if questions_collection.count_documents({}) == 0:
            questions_collection.insert_many(DSA_QUESTIONS)
            print("Successfully seeded coding questions in MongoDB")
    except Exception as e:
        print("Failed to seed coding questions:", e)

# Trigger seeding
seed_coding_questions()
