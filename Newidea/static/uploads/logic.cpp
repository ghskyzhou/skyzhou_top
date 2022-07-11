#include <iostream>
using namespace std;

//string a;

string yasuo(string b)
{
	string::iterator it;
	for (it = b.begin(); *it; it++)
		if (*it == ' ') b.erase(it);
	return b;
}

string run(int x, string a)
{
	while(a.length() > 1 && a[x] != ')' && x <= a.length())
	{
		//cout << "x: " << x << endl;
		cout << a << endl;
		if(a[x] == '&' && a[x-1] != ')' && a[x+1] != '(') //& and
		{
			if(a[x-1] == '1' and a[x+1] == '1') a[x] = '1';
			else a[x] = '0';
			a[x-1] = a[x+1] = ' ';
		}
		
		if(a[x] == '|' && a[x-1] != ')' && a[x+1] != '(') //| or
		{
			if(a[x-1] == '1' or a[x+1] == '1') a[x] = '1';
			else a[x] = '0';
			a[x-1] = a[x+1] = ' ';
		}
		
		if(a[x] == '^' && a[x-1] != ')' && a[x+1] != '(') //^ xor
		{
			if(a[x-1] == '0' or a[x+1] == '0') a[x] = '1';
			else a[x] = '0';
			a[x-1] = a[x+1] = ' ';
		}
		
		if(a[x] == '!' && a[x+1] != '(') //! not
		{
			if(a[x+1] == '1') a[x+1] = '0';
			else if(a[x+1] == '0') a[x+1] = '1';
			a[x] = ' ';
		}
		
		if(a[x] == '(') run(x+1, a);
		if(a[x] == '(' && a[x+2] == ')') a[x] = a[x+2] = ' ';
		x++;
		a = yasuo(a);
	}
	return a;
}

int main()
{
	string a;
	cin >> a;
	
	while(a.length() > 1) a = run(0, a);
	
	//cout << "yasuo: " << yasuo("123 456") << endl;
	cout << a;
	return 0;
} 
