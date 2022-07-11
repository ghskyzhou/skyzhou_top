#include <iostream>
using namespace std;

string a;

string yasuo(string b)
{
	string::iterator it;
	for (it = b.begin(); *it; it++)
		if (*it == ' ') b.erase(it);
	return b;
}

int run(int x)
{
	while(a.length() > 1 && a[x] != ')')
	{
		cout << "x: " << x << endl;
		cout << a << endl;
		if(a[x] == '&' && a[x-1] != ')' && a[x+1] != '(')
		{
			if(a[x-1] == '1' and a[x+1] == '1') a[x] = '1';
			else a[x] = '0';
			a[x-1] = a[x+1] = ' ';
		}
		if(a[x] == '|' && a[x-1] != ')' && a[x+1] != '(')
		{
			if(a[x-1] == '1' or a[x+1] == '1') a[x] = '1';
			else a[x] = '0';
			a[x-1] = a[x+1] = ' ';
		}
		if(a[x] == '!' && a[x+1] != '(')
		{
			if(a[x+1] == '1') a[x+1] = '0';
			else if(a[x+1] == '0') a[x+1] = '1';
			a[x] = ' ';
		}
		if(a[x] == '(') run(x+1);
		if(a[x] == '(' && a[x+2] == ')') a[x] = a[x+2] = ' ';
		x++;
		a = yasuo(a);
	}
	return 0;
}

int main()
{
	cin >> a;
	
	while(a.length() > 1) run(0);
	
	//cout << "yasuo: " << yasuo("123 456") << endl;
	cout << a;
	return 0;
}
